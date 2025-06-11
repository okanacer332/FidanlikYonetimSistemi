// server/src/index.js

// Gerekli Kütüphaneler
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// GraphQL Şema ve Resolver'lar
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

// Veritabanı Modelleri
const Kullanici = require('./models/Kullanici');
const Permission = require('./models/Permission');
const Role = require('./models/Role');

// Ortam Değişkenlerini Yükle
dotenv.config();


// --- BAŞLANGIÇ VERİLERİ (SEED DATA) ---

// Sistemdeki tüm olası izinleri tanımlıyoruz
const allPermissions = [
  { action: 'fidan:create', description: 'Yeni fidan ekleyebilir' },
  { action: 'fidan:read', description: 'Fidanları listeleyebilir ve görebilir' },
  { action: 'fidan:update', description: 'Fidan bilgilerini güncelleyebilir' },
  { action: 'fidan:delete', description: 'Fidan silebilir' },
  { action: 'user:create', description: 'Yeni kullanıcı oluşturabilir' },
  { action: 'user:read', description: 'Kullanıcıları görebilir' },
  { action: 'user:update', description: 'Kullanıcı bilgilerini güncelleyebilir' },
  { action: 'user:delete', description: 'Kullanıcı silebilir' },
  { action: 'role:manage', description: 'Rolleri ve izinlerini yönetebilir' },
  // İleride siparis:create, siparis:read gibi izinler eklenebilir
];

// Veritabanını başlangıç verileriyle dolduran fonksiyon
const seedDatabase = async () => {
  try {
    console.log('🌱 Veritabanı seeding işlemi başlıyor...');

    // 1. Tüm izinlerin veritabanında var olduğundan emin ol
    const permissionPromises = allPermissions.map(perm =>
      Permission.findOneAndUpdate({ action: perm.action }, perm, { upsert: true, new: true })
    );
    const savedPermissions = await Promise.all(permissionPromises);
    console.log('🔑 Temel izinler kontrol edildi/oluşturuldu.');

    // 2. Varsayılan Müşteri ID'sini tanımla
    const musteriId = 'ekizfidancilik';

    // 3. Varsayılan rolleri ve izinlerini tanımla
    const rolesToSeed = [
      {
        name: 'Yönetici',
        musteriId,
        permissions: savedPermissions.map(p => p._id) // Yönetici tüm izinlere sahiptir
      },
      {
        name: 'Satış Personeli',
        musteriId,
        permissions: savedPermissions.filter(p => ['fidan:read'].includes(p.action)).map(p => p._id)
      },
      {
        name: 'Depo Sorumlusu',
        musteriId,
        permissions: savedPermissions.filter(p => ['fidan:read', 'fidan:update'].includes(p.action)).map(p => p._id)
      }
    ];

    const rolePromises = rolesToSeed.map(roleData => 
      Role.findOneAndUpdate({ name: roleData.name, musteriId: roleData.musteriId }, roleData, { upsert: true, new: true })
    );
    await Promise.all(rolePromises);
    console.log('🧑‍⚖️ Varsayılan roller kontrol edildi/oluşturuldu.');


    // 4. İlk Yönetici kullanıcısını oluştur veya güncelle
    const adminEmail = 'admin@ekiz.com';
    const adminRole = await Role.findOne({ name: 'Yönetici', musteriId });

    if (adminRole) {
        await Kullanici.findOneAndUpdate(
            { email: adminEmail },
            { 
                $setOnInsert: { // Sadece yeni oluşturulursa şifreyi ata
                    sifre: await bcrypt.hash('admin123', 12)
                },
                role: adminRole._id, // Her durumda rolü ata/güncelle
                musteriId: musteriId
            },
            { upsert: true, new: true } // Varsa güncelle, yoksa oluştur
        );
        console.log('👑 Yönetici kullanıcısı kontrol edildi/güncellendi.');
    }
    console.log('✅ Seeding işlemi tamamlandı.');

  } catch (error) {
    console.error('Seeding sırasında bir hata oluştu:', error);
  }
};


// Sunucuyu başlatan ana fonksiyon
const startServer = async () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const token = req.headers.authorization || '';
      try {
        if (token) {
          const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
          // Token'dan gelen kullanıcı ID'si ile veritabanından kullanıcıyı bul
          // ve rolüyle birlikte izinlerini de anlık olarak getir (.populate)
          const kullanici = await Kullanici.findById(decodedToken.id).populate({
            path: 'role',
            populate: { path: 'permissions' }
          });
          return { kullanici };
        }
        return {};
      } catch (err) {
        return {};
      }
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;

  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('🍃 MongoDB bağlantısı başarılı.');
      
      // Veritabanı bağlandıktan sonra SEED fonksiyonunu çalıştır
      await seedDatabase();

      app.listen(PORT, () =>
        console.log(`🚀 Sunucu http://localhost:${PORT}${server.graphqlPath} adresinde çalışıyor.`)
      );
    })
    .catch(err => {
      console.error('Veritabanı bağlantı hatası:', err.message);
    });
};

startServer();