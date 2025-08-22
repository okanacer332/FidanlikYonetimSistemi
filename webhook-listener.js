const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

// DİKKAT: Buraya tahmin edilmesi zor, uzun ve karmaşık bir şifre yaz.
const WEBHOOK_SECRET = 'okanumutacer33'; 
const DEPLOY_SCRIPT_PATH = '/home/deploy/fidanys-app/deploy.sh'; // Sunucudaki script'in yolu
const PORT = 9001;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let data = '';
    req.on('data', chunk => { data += chunk; });

    req.on('end', () => {
      try {
        const signature = req.headers['x-hub-signature-256'];
        if (!signature) {
          throw new Error('İmza başlığı eksik.');
        }

        const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
        const digest = 'sha256=' + hmac.update(data).digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
          throw new Error('İmza doğrulaması başarısız.');
        }
        
        console.log(`[${new Date().toISOString()}] Webhook doğrulandı. Deploy script'i çalıştırılıyor...`);
        
        exec(`bash ${DEPLOY_SCRIPT_PATH}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`[${new Date().toISOString()}] HATA: Deploy script'i çalıştırılamadı: ${error}`);
            return;
          }
          if (stdout) console.log(`[${new Date().toISOString()}] Script Çıktısı:\n${stdout}`);
          if (stderr) console.error(`[${new Date().toISOString()}] Script Hatası:\n${stderr}`);
        });

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Deploy isteği alındı ve işleme kondu.');

      } catch (e) {
        console.error(`[${new Date().toISOString()}] Webhook işlenirken hata: ${e.message}`);
        res.writeHead(403, {'Content-Type': 'text/plain'});
        res.end('Yetkisiz istek.');
      }
    });
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Endpoint bulunamadı.');
  }
});

server.listen(PORT, () => {
  console.log(`Webhook listener ${PORT} portunda başarıyla başlatıldı.`);
});