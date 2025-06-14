// Konum: server/src/index.js

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const cors = require('cors');
require('dotenv').config();

// Modeller
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const Kullanici = require('./models/Kullanici');
const Fidan = require('./models/Fidan'); // Fidan modelini de ekledik
const bcrypt = require('bcryptjs');

const startServer = async () => {
  const app = express();
  app.use(cors());

  const { getUserFromReq } = require('./utils/auth');

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const user = await getUserFromReq(req);
      return { req, user };
    }
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;

  mongoose
    .connect(process.env.MONGO_URI, {})
    .then(() => {
      console.log('MongoDB bağlantısı başarılı.');
      app.listen(PORT, () => console.log(`Sunucu http://localhost:4000/graphql adresinde çalışıyor`));

      // --- OTOMATİK TEMİZLEYEN VE YENİDEN OLUŞTURAN SEED FONKSİYONU ---
      const seedDatabase = async () => {
        // Sadece geliştirme ortamında çalışmasını sağlıyoruz
        if (process.env.NODE_ENV !== 'development') {
          console.log('Üretim ortamında otomatik seed işlemi devre dışı.');
          return;
        }

        try {
          // 1. Tüm eski verileri sil. Hata vermemesi için "catch" ekledik.
          console.log('Geliştirme veritabanı temizleniyor...');
          await Role.deleteMany({});
          await Permission.deleteMany({});
          await Kullanici.deleteMany({});
          await Fidan.deleteMany({}); // Fidanları da temizliyoruz
          console.log('Veritabanı temizlendi.');

          // 2. İzinleri oluştur
          console.log('İzinler oluşturuluyor...');
          const tumYetkiler = await new Permission({ izinAdi: 'TUM_YETKILER', aciklama: 'Sistemdeki tüm yetkileri kapsar.' }).save();

          // 3. Rolleri oluştur
          console.log('Roller oluşturuluyor...');
          const yoneticiRol = await new Role({ rolAdi: 'Yönetici', izinler: [tumYetkiler._id] }).save();
          await new Role({ rolAdi: 'Satış Personeli', izinler: [] }).save();
          await new Role({ rolAdi: 'Depo Sorumlusu', izinler: [] }).save();
          
          // 4. Admin kullanıcısını oluştur
          console.log("Yönetici kullanıcı oluşturuluyor...");
          const hashedPassword = await bcrypt.hash('admin', 10);
          await new Kullanici({
            kullaniciAdi: 'admin',
            email: 'admin@fidanlik.com',
            sifre: hashedPassword,
            roller: [yoneticiRol._id]
          }).save();
          
          console.log("-----------------------------------------------------------------");
          console.log("Veritabanı başarıyla sıfırlandı. 'admin'/'admin' kullanıcısı hazır.");
          console.log("-----------------------------------------------------------------");

        } catch (error) {
          console.error('Veritabanı seed işlemi sırasında bir hata oluştu:', error);
        }
      };

      seedDatabase();
      // --- YENİ SEED FONKSİYONU BİTİŞİ ---
    })
    .catch((err) => {
      console.error('MongoDB bağlantı hatası:', err);
    });
};

startServer();