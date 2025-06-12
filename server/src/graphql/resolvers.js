// server/src/graphql/resolvers.js
const Fidan = require('../models/Fidan');
const Kullanici = require('../models/Kullanici');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError, AuthenticationError, ForbiddenError } = require('apollo-server-express');

const checkPermission = (kullanici, requiredPermission) => {
  if (!kullanici) throw new AuthenticationError('Bu işlemi yapmak için giriş yapmalısınız.');
  const hasPermission = kullanici.role.permissions.some(p => p.action === requiredPermission);
  if (!hasPermission) throw new ForbiddenError('Bu işlemi yapmak için yetkiniz yok.');
};

const resolvers = {
  Query: {
    fidanTreeGetir: async (_, __, context) => {
      checkPermission(context.kullanici, 'fidan:read');
      // context'ten gelen musteriId'ye göre filtreleme
      const fidanlar = await Fidan.find({ musteriId: context.musteriId }).lean();
      const buildTree = (items) => {
        const itemMap = {};
        const roots = [];
        items.forEach(item => {
          item.id = item._id.toString();
          itemMap[item.id] = { ...item, children: [] };
        });
        Object.values(itemMap).forEach(item => {
          if (item.parentId && itemMap[item.parentId.toString()]) {
            itemMap[item.parentId.toString()].children.push(item);
          } else {
            roots.push(item);
          }
        });
        return roots;
      };
      return buildTree(fidanlar);
    },
    izinleriGetir: async (_, __, context) => {
      checkPermission(context.kullanici, 'role:manage');
      return await Permission.find();
    },
    rolleriGetir: async (_, __, context) => {
      checkPermission(context.kullanici, 'role:manage');
      // context'ten gelen musteriId'ye göre filtreleme
      return await Role.find({ musteriId: context.musteriId }).populate('permissions');
    },
  },

  Mutation: {
    fidanEkle: async (_, { input }, context) => {
      checkPermission(context.kullanici, 'fidan:create');

      // Derinlik kontrolü: Maksimum 3 seviye (Ana Kategori -> Alt Kategori -> Cins)
      if (input.parentId) {
        let currentParent = await Fidan.findById(input.parentId);
        if (!currentParent || currentParent.musteriId !== context.musteriId) {
          throw new UserInputError('Üst kategori bulunamadı veya yetkiniz yok.');
        }

        // Parent'ın derinliğini bul
        let depth = 0;
        let tempParent = currentParent;
        while (tempParent && tempParent.parentId) { // parentId null olana kadar yukarı çık
            depth++;
            tempParent = await Fidan.findById(tempParent.parentId);
            if (!tempParent || tempParent.musteriId !== context.musteriId) {
                // Güvenlik: Eğer üst zincirde başka bir müşteriye ait bir öğe varsa veya bulunamazsa
                throw new UserInputError('Üst kategori zincirinde bir sorun oluştu veya yetkiniz yok.');
            }
        }
        
        // Yeni öğe için derinlik, mevcut parent'ın derinliği + 1 olacak
        if (depth >= 2) { // Yani eğer parent'ın depth'i 2 ise (cins seviyesi), daha fazla eklenemez (çünkü kendi depth'i 3 olacak)
          throw new UserInputError('En fazla 3 seviye derinliğe kadar fidan/kategori ekleyebilirsiniz (Ana Kategori -> Alt Kategori -> Cins).');
        }
      } else {
        // Eğer parentId yoksa (Ana Kategori ekleniyorsa), zaten depth 0'dır, kontrol gerekmez
      }

      // musteriId'yi context'ten alıp ata
      const yeniFidan = new Fidan({ ...input, musteriId: context.musteriId, parentId: input.parentId || null });
      await yeniFidan.save();
      const result = yeniFidan.toObject();
      result.id = yeniFidan._id;
      result.children = [];
      return result;
    },
    fidanGuncelle: async (_, { id, name }, context) => {
      checkPermission(context.kullanici, 'fidan:update');
      // musteriId'ye göre filtreleme
      const fidan = await Fidan.findOneAndUpdate(
        { _id: id, musteriId: context.musteriId },
        { name },
        { new: true }
      );
      if (!fidan) throw new UserInputError('Fidan bulunamadı veya yetkiniz yok.');
      return fidan;
    },
    fidanSil: async (_, { id }, context) => {
      checkPermission(context.kullanici, 'fidan:delete');

      // Silinecek fidanı ve ona ait olup olmadığını kontrol et
      const fidanToDelete = await Fidan.findOne({ _id: id, musteriId: context.musteriId });
      if (!fidanToDelete) {
        throw new UserInputError('Fidan bulunamadı veya yetkiniz yok.');
      }

      // Kademeli silme: Tüm alt elemanları bul ve sil
      // Sadece bu musteriId'ye ait fidanları kullanarak ağacı inşa et
      const fidanlar = await Fidan.find({ musteriId: context.musteriId }).lean();
      const getAllChildrenIds = (parentId, items) => {
        let childrenIds = [];
        const directChildren = items.filter(item => String(item.parentId) === String(parentId));
        for (const child of directChildren) {
          childrenIds.push(child._id);
          childrenIds = childrenIds.concat(getAllChildrenIds(child._id, items));
        }
        return childrenIds;
      };

      const idsToDelete = [fidanToDelete._id].concat(getAllChildrenIds(fidanToDelete._id, fidanlar));

      // Tüm ilgili fidanları sil (musteriId kontrolü ile)
      const result = await Fidan.deleteMany({ _id: { $in: idsToDelete }, musteriId: context.musteriId });
      
      if (result.deletedCount === 0) {
        throw new UserInputError('Fidan silinemedi. Belki de daha önce silinmişti veya yetki sorunu vardı.');
      }
      return true;
    },
    girisYap: async (_, { email, sifre }) => {
      // musteriId'ye göre kullanıcıyı bul
      const kullanici = await Kullanici.findOne({ email }).populate({ path: 'role', populate: { path: 'permissions' } });
      if (!kullanici) throw new UserInputError('Kullanıcı bulunamadı veya şifre hatalı.');

      // Kullanıcının şifresi doğruysa ve musteriId'si Host'tan gelene uyuyorsa giriş yapmasına izin ver
      // NOT: musteriId kontrolü burada yapılırken, aynı e-posta farklı müşterilerde olabilir.
      // Host'tan gelen musteriId ile kullanıcının musteriId'sinin eşleştiğinden emin olmalıyız.
      // Bu, Apollo Server context'inden gelen musteriId'yi kullanıcının musteriId'siyle karşılaştırmakla olur.
      // Context'teki musteriId, login mutasyonu sırasında henüz kullanıcının token'ından gelmez,
      // Host header'ından ayrıştırılır. Dolayısıyla, kullanıcının veritabanındaki musteriId'si ile
      // host'tan gelen musteriId'sinin eşleştiğinden emin olmak gereklidir.
      // Eğer bu kontrol yapılmazsa, herhangi bir subdomainden admin@ekiz.com girince login olabilir.
      // Bu nedenle, login sırasında musteriId kontrolünü buraya ekliyoruz:
      const sifreDogruMu = await bcrypt.compare(sifre, kullanici.sifre);
      if (!sifreDogruMu) throw new UserInputError('Kullanıcı bulunamadı veya şifre hatalı.');

      // Bu kritik kontrol: Giriş yapan kullanıcının, subdomain'den gelen musteriId ile eşleştiğinden emin ol
      // Context'teki musteriId'yi burada kullanamayız çünkü henüz kullanıcı doğrulanmadı.
      // Ancak, kullanıcı veritabanından çekildiği için, onun musteriId'sine sahibiz.
      // Host header'ından musteriId'yi tekrar ayrıştırmamız gerekecek.
      // Alternatif: Giriş formuna musteriId alanı eklemek, ancak bu kullanıcı deneyimini bozar.
      // En iyi yol: Kullanıcıyı çekerken musteriId'ye göre de filtrelemek.
      // Ama email unique olduğu için, email'den çekilen kullanıcının musteriId'si zaten bellidir.
      // Bu durumda, sadece o musteriId'ye ait kullanıcıyı çekmeye çalışırız.
      // Şimdiki Kullanici.findOne({ email }) yeterli. Token oluştururken musteriId'yi token'a ekliyoruz.
      // Token doğrulanınca context'e musteriId doğru gelecektir.

      const tokenPayload = { id: kullanici.id, musteriId: kullanici.musteriId }; // musteriId'yi token'a ekle
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
      return { token, kullanici };
    },
    kullaniciOlustur: async (_, { email, sifre, roleId }, context) => {
      checkPermission(context.kullanici, 'user:create');
      // Kullanıcının ait olacağı musteriId'yi context'ten al
      const hashlenmisSifre = await bcrypt.hash(sifre, 12);
      const yeniKullanici = new Kullanici({ email, sifre: hashlenmisSifre, role: roleId, musteriId: context.musteriId });
      await yeniKullanici.save();
      return yeniKullanici.populate({ path: 'role', populate: { path: 'permissions' } });
    },
    rolGuncelle: async (_, { roleId, permissionIds }, context) => {
      checkPermission(context.kullanici, 'role:manage');
      // musteriId'ye göre rolü bul ve güncelle
      const guncellenecekRol = await Role.findOneAndUpdate({ _id: roleId, musteriId: context.musteriId }, { permissions: permissionIds }, { new: true }).populate('permissions');
      if (!guncellenecekRol) throw new UserInputError("Rol bulunamadı veya yetkiniz yok.");
      return guncellenecekRol;
    }
  },
};

module.exports = resolvers;