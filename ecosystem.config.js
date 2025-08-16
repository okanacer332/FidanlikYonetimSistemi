module.exports = {
  apps: [
    {
      // --- İstemci (Next.js) Uygulaması ---
      name: 'fidanys-client',
      // 'next' komutunun tam yolunu vererek belirsizliği ortadan kaldırıyoruz
      script: '/opt/fidanlikyonetimsistemi/client/node_modules/next/dist/bin/next',
      args: 'start', // Çalıştırılacak komut 'start'
      cwd: '/opt/fidanlikyonetimsistemi/client/', // İstemci projesinin yolu
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_BASE_URL: 'http://fidanys.com.tr/api'
      },
    },
    {
      // --- Sunucu (Spring Boot) Uygulaması ---
      name: 'fidanys-server',
      script: 'java',
      args: '-jar target/fidanys-server-0.0.1-SNAPSHOT.jar',
      cwd: '/opt/fidanlikyonetimsistemi/fidanys-server/', // Sunucu projesinin yolu
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