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
const Fidan = require('./models/Fidan'); // Fidan modelini de burada tanımlayalım (seedDatabase içinde kullanılıyor)


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

    // 2. Birden fazla müşteri için varsayılan verileri oluştur
    const tenantIdsToSeed = ['fidanys', 'ata', 'okan']; // Tanımlı müşteri ID'leri

    for (const musteriId of tenantIdsToSeed) {
      console.log(`\n⚙️ Müşteri ID: ${musteriId} için rol ve kullanıcı oluşturuluyor...`);

      // Varsayılan rolleri ve izinlerini tanımla (her musteriId için)
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
      console.log(`🧑‍⚖️ Müşteri ${musteriId} için varsayılan roller kontrol edildi/oluşturuldu.`);

      // İlk Yönetici kullanıcısını oluştur veya güncelle (her musteriId için)
      const adminEmail = `admin@${musteriId}.com`; // Her müşteri için kendi admin maili
      const adminRole = await Role.findOne({ name: 'Yönetici', musteriId });

      if (adminRole) {
          await Kullanici.findOneAndUpdate(
              { email: adminEmail },
              {
                  $setOnInsert: { // Sadece yeni oluşturulursa şifreyi ata
                      sifre: await bcrypt.hash('admin123', 12) // Tüm adminler için aynı şifre
                  },
                  role: adminRole._id, // Her durumda rolü ata/güncelle
                  musteriId: musteriId
              },
              { upsert: true, new: true } // Varsa güncelle, yoksa oluştur
          );
          console.log(`👑 Müşteri ${musteriId} için yönetici kullanıcısı kontrol edildi/güncellendi.`);
      }
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
      let kullanici = null;
      let musteriId = null;

      try {
        if (token) {
          const decodedToken = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
          kullanici = await Kullanici.findById(decodedToken.id).populate({
            path: 'role',
            populate: { path: 'permissions' }
          });
          musteriId = kullanici.musteriId; // Kullanıcı giriş yapmışsa musteriId'yi token'dan/kullanıcıdan al
        } else {
          // Token yoksa (örn: login anında veya ilk sayfa yüklemede), musteriId'yi domain'den al
          const host = req.headers.host; // örn: "ata.fidanys.xyz" veya "localhost:3000"
          const parts = host.split('.');
          
          // Subdomain varsa (örn: ata.fidanys.xyz -> parts[0] = "ata") ve "www" değilse
          if (parts.length >= 3 && parts[0] !== 'www') { 
            musteriId = parts[0]; // İlk kısım (subdomain) musteriId olabilir
          } else if (host.includes('localhost') || host.includes('127.0.0.1')) {
            // Geliştirme ortamı (localhost) için varsayılan musteriId
            musteriId = 'fidanys'; // Lokal için fidanys kullan
          } else {
            // Ana domain'den (fidanys.xyz) veya "www.fidanys.xyz" gibi bir adresden gelirse
            // varsayılan olarak ana şirket musteriId'sini ata.
            musteriId = 'fidanys'; 
          }
        }
        
        // Eğer musteriId hala boşsa veya tanımsızsa, güvenlik için varsayılan atayabiliriz
        if (!musteriId) {
            musteriId = 'fidanys'; // Son çare varsayılan atama
        }

        return { kullanici, musteriId }; // musteriId'yi context'e ekle
      } catch (err) {
        console.error('Context oluşturulurken veya token doğrulanırken hata:', err.message);
        // Hata durumunda (örn: geçersiz token) da bir musteriId sağlamak gerekebilir.
        return { musteriId: 'fidanys' }; // Hata durumunda varsayılan musteriId ile devam et
      }
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;

  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('🍃 MongoDB bağlantısı başarılı.');
      await seedDatabase(); // Veritabanı bağlandıktan sonra SEED fonksiyonunu çalıştır
      app.listen(PORT, () =>
        console.log(`🚀 Sunucu http://localhost:${PORT}${server.graphqlPath} adresinde çalışıyor.`)
      );
    })
    .catch(err => {
      console.error('Veritabanı bağlantı hatası:', err.message);
    });
};

startServer();