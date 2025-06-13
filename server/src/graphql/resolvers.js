const jwt = require('jsonwebtoken');
// ==================== DÜZELTİLEN SATIR AŞAĞIDA ====================
const bcrypt = require('bcryptjs'); // Hatalı olan 'bcryptjs' metni, require ile düzeltildi.
// =================================================================
const Kullanici = require('../models/Kullanici');
const Fidan = require('../models/Fidan');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

const resolvers = {
  Query: {
    kullanicilar: async () => {
      return await Kullanici.find({}).populate('roller');
    },
    roller: async () => {
      return await Role.find({}).populate('izinler');
    },
    izinler: async () => {
      return await Permission.find({});
    },
    fidanlar: async () => {
      return await Fidan.find({});
    },
    getDashboardData: async () => {
      const toplamFidanCesidi = await Fidan.countDocuments();
      const stokToplami = await Fidan.aggregate([
        {
          $group: {
            _id: null,
            toplamStok: { $sum: '$stokMiktari' }
          }
        }
      ]);
      const toplamStokAdedi = stokToplami.length > 0 ? stokToplami[0].toplamStok : 0;
      return {
        toplamFidanCesidi,
        toplamStokAdedi
      };
    }
  },

  Mutation: {
    kullaniciOlustur: async (_, { kullaniciAdi, email, sifre, roller }) => {
      const hashedPassword = await bcrypt.hash(sifre, 10);
      const yeniKullanici = new Kullanici({
        kullaniciAdi,
        email,
        sifre: hashedPassword,
        roller
      });
      await yeniKullanici.save();
      return await Kullanici.findById(yeniKullanici.id).populate('roller');
    },

    rolOlustur: async (_, { rolAdi, izinler }) => {
      const yeniRol = new Role({
        rolAdi,
        izinler
      });
      await yeniRol.save();
      return await Role.findById(yeniRol.id).populate('izinler');
    },

    izinOlustur: async (_, { izinAdi, aciklama }) => {
      const yeniIzin = new Permission({
        izinAdi,
        aciklama
      });
      await yeniIzin.save();
      return yeniIzin;
    },

    fidanEkle: async (_, args) => {
      const yeniFidan = new Fidan(args);
      await yeniFidan.save();
      return yeniFidan;
    },

    fidanGuncelle: async (_, { id, ...updates }) => {
      return await Fidan.findByIdAndUpdate(id, updates, { new: true });
    },
    
    fidanSil: async (_, { id }) => {
      const silinenFidan = await Fidan.findByIdAndDelete(id);
      return silinenFidan ? true : false;
    },

    girisYap: async (_, { kullaniciAdi, sifre }) => {
      const kullanici = await Kullanici.findOne({ kullaniciAdi }).populate('roller');
      if (!kullanici) {
        throw new Error('Kullanıcı bulunamadı!');
      }

      const isMatch = await bcrypt.compare(sifre, kullanici.sifre);
      if (!isMatch) {
        throw new Error('Geçersiz parola!');
      }

      const payload = {
        id: kullanici.id,
        kullaniciAdi: kullanici.kullaniciAdi,
        roller: kullanici.roller.map(role => role.rolAdi)
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'varsayilan_gizli_anahtar',
        { expiresIn: '1d' }
      );

      return {
        token,
        kullanici: {
          id: kullanici.id,
          kullaniciAdi: kullanici.kullaniciAdi,
          email: kullanici.email,
          roller: kullanici.roller,
        }
      };
    },
  },

  Kullanici: {
    roller: async (parent) => {
      return await Role.find({ _id: { $in: parent.roller } }).populate('izinler');
    }
  },
  Role: {
    izinler: async (parent) => {
      return await Permission.find({ _id: { $in: parent.izinler } });
    }
  }
};

module.exports = resolvers;