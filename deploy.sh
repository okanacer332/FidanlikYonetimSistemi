#!/bin/bash

# Herhangi bir komut başarısız olursa script'i durdur. Bu önemlidir!
set -e

echo "================================================="
echo "Deploy süreci başlatıldı: $(date)"
echo "================================================="

# Proje dizinine git
# Scriptin kendi bulunduğu dizine gitmek en garantili yoldur
cd "$(dirname "$0")"

# Değişiklikleri main branch'inden çek
echo ">>> Adım 1: En güncel kod çekiliyor (git pull)..."
git pull origin main

echo ">>> Adım 2: Backend derleniyor (Maven)..."
cd fidanys-server
# -DskipTests ile testleri atlayarak derlemeyi hızlandırıyoruz
mvn clean package -DskipTests
echo "Backend derlemesi tamamlandı."

echo ">>> Adım 3: Backend servisi yeniden başlatılıyor (systemd)..."
# sudo komutu şifresiz çalışabilmeli (bir sonraki adımda ayarlayacağız)
sudo systemctl restart fidanys-backend
echo "Backend servisi yeniden başlatıldı."

# Ana dizine geri dön
cd ..

echo ">>> Adım 4: Frontend bağımlılıkları yükleniyor ve derleniyor (npm)..."
cd client
npm install
npm run build
echo "Frontend derlemesi tamamlandı."

echo ">>> Adım 5: Frontend servisi yeniden başlatılıyor (pm2)..."
# Eğer uygulama zaten çalışıyorsa restart eder, değilse başlatır.
pm2 restart fidanys-frontend || pm2 start npm --name "fidanys-frontend" -- run start
echo "Frontend servisi yeniden başlatıldı."

echo "================================================="
echo "Deploy süreci başarıyla tamamlandı: $(date)"
echo "================================================="