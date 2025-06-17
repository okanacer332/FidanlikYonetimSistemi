module.exports = {
  apps: [
    {
      // --- İstemci (Next.js) Uygulaması ---
      name: 'fidanys-client',
      script: 'npx',
      args: 'next start',
      cwd: '/opt/fidanlikyonetimsistemi/client/', // İstemci projesinin yolu
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        // Nginx yönlendirmesi sayesinde API adresini bu şekilde veriyoruz
        NEXT_PUBLIC_API_BASE_URL: 'http://ata.fidanys.xyz/api'
        // Eğer HTTPS kullanıyorsanız: 'https://ata.fidanys.xyz/api'
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
        // Örneğin: SPRING_PROFILES_ACTIVE: 'prod'
      },
    },
  ],
};
