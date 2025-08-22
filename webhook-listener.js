const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');

const WEBHOOK_SECRET = 'okanumutacer33'; 
const DEPLOY_SCRIPT_PATH = '/home/deploy/fidanys-app/deploy.sh';
const PORT = 9001;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let data = '';
    req.on('data', chunk => { data += chunk; });

    req.on('end', () => {
      try {
        const signature = req.headers['x-hub-signature-256'];
        if (!signature) { throw new Error('İmza başlığı eksik.'); }

        const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET); // HATA BURADAYDI, 'sha256' OLARAK DÜZELTİLDİ
        const digest = 'sha256=' + hmac.update(data).digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
          throw new Error('İmza doğrulaması başarısız.');
        }
        
        console.log(`[${new Date().toISOString()}] Webhook doğrulandı. Deploy script'i çalıştırılıyor...`);
        
        const deployProcess = spawn('bash', [DEPLOY_SCRIPT_PATH]);

        deployProcess.stdout.on('data', (chunk) => {
          console.log(chunk.toString());
        });

        deployProcess.stderr.on('data', (chunk) => {
          console.error(chunk.toString());
        });
        
        deployProcess.on('close', (code) => {
          console.log(`[${new Date().toISOString()}] Deploy script'i ${code} koduyla tamamlandı.`);
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