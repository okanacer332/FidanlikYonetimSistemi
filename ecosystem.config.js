module.exports = {
  apps: [
    {
      // --- İstemci (Next.js) Uygulaması ---
      name: 'fidanys-client',
      script: '/opt/fidanlikyonetimsistemi/client/node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/opt/fidanlikyonetimsistemi/client/',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        // 1. BU SATIRI TAMAMEN SİLİYORUZ VEYA YORUMA ALIYORUZ
        // NEXT_PUBLIC_API_BASE_URL: 'http://fidanys.com.tr/api'
      },
    },
    {
  // --- Sunucu (Spring Boot) Uygulaması ---
  name: 'fidanys-server',
  script: '/opt/fidanlikyonetimsistemi/fidanys-server/target/fidanys-server-0.0.1-SNAPSHOT.jar', // <-- BURAYI DEĞİŞTİRDİK
  // args: ['-jar', '...'] satırını sildik, script artık doğrudan JAR dosyasını gösteriyor
  cwd: '/opt/fidanlikyonetimsistemi/fidanys-server/',
  instances: 1,
  autorestart: true,
  watch: false,
  max_memory_restart: '1G',
  env: {
    // Gerekirse buraya sunucu için ortam değişkenleri ekleyebilirsiniz.
  },
},
  ],
};