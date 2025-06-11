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
      const fidanlar = await Fidan.find({ musteriId: context.kullanici.musteriId }).lean();
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
      return await Role.find({ musteriId: context.kullanici.musteriId }).populate('permissions');
    },
  },

  Mutation: {
    fidanEkle: async (_, { input }, context) => {
      checkPermission(context.kullanici, 'fidan:create');
      const yeniFidan = new Fidan({ ...input, musteriId: context.kullanici.musteriId, parentId: input.parentId || null });
      await yeniFidan.save();
      const result = yeniFidan.toObject();
      result.id = yeniFidan._id;
      result.children = [];
      return result;
    },
    fidanGuncelle: async (_, { id, name }, context) => {
      checkPermission(context.kullanici, 'fidan:update');
      const fidan = await Fidan.findOneAndUpdate(
        { _id: id, musteriId: context.kullanici.musteriId },
        { name },
        { new: true }
      );
      if (!fidan) throw new UserInputError('Fidan bulunamadı veya yetkiniz yok.');
      return fidan;
    },
    fidanSil: async (_, { id }, context) => {
      checkPermission(context.kullanici, 'fidan:delete');
      const childCount = await Fidan.countDocuments({ parentId: id });
      if (childCount > 0) {
        throw new UserInputError('İçinde alt elemanlar bulunan bir kategori silinemez.');
      }
      const result = await Fidan.findOneAndDelete({ _id: id, musteriId: context.kullanici.musteriId });
      if (!result) throw new UserInputError('Fidan bulunamadı veya yetkiniz yok.');
      return true;
    },
    girisYap: async (_, { email, sifre }) => {
      const kullanici = await Kullanici.findOne({ email }).populate({ path: 'role', populate: { path: 'permissions' } });
      if (!kullanici) throw new UserInputError('Kullanıcı bulunamadı veya şifre hatalı.');
      const sifreDogruMu = await bcrypt.compare(sifre, kullanici.sifre);
      if (!sifreDogruMu) throw new UserInputError('Kullanıcı bulunamadı veya şifre hatalı.');
      const tokenPayload = { id: kullanici.id, musteriId: kullanici.musteriId };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
      return { token, kullanici };
    },
    kullaniciOlustur: async (_, { email, sifre, roleId }, context) => {
      checkPermission(context.kullanici, 'user:create');
      const hashlenmisSifre = await bcrypt.hash(sifre, 12);
      const yeniKullanici = new Kullanici({ email, sifre: hashlenmisSifre, role: roleId, musteriId: context.kullanici.musteriId });
      await yeniKullanici.save();
      return yeniKullanici.populate({ path: 'role', populate: { path: 'permissions' } });
    },
    rolGuncelle: async (_, { roleId, permissionIds }, context) => {
      checkPermission(context.kullanici, 'role:manage');
      const guncellenecekRol = await Role.findOneAndUpdate({ _id: roleId, musteriId: context.kullanici.musteriId }, { permissions: permissionIds }, { new: true }).populate('permissions');
      if (!guncellenecekRol) throw new UserInputError("Rol bulunamadı.");
      return guncellenecekRol;
    }
  },
};

module.exports = resolvers;