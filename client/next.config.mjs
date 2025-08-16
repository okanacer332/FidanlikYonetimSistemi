/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  async rewrites() {
    return [
      // --- YENİ EKLENEN API PROXY KURALI ---
      // Bu kural, sadece geliştirme ortamında çalışır ve /api/ ile başlayan
      // tüm istekleri 8080 portundaki backend sunucusuna yönlendirir.
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },

      // --- MEVCUT URL YÖNLENDİRMELERİNİZ ---
      // Ana Rotalar
      { source: '/dashboard/profilim', destination: '/dashboard/account' },
      
      // Tanımlar
      { source: '/dashboard/tanimlar/fidan-yonetimi', destination: '/dashboard/plants' },
      { source: '/dashboard/tanimlar/depo-yonetimi', destination: '/dashboard/warehouses' },
      { source: '/dashboard/tanimlar/musteri-yonetimi', destination: '/dashboard/customers' },
      { source: '/dashboard/tanimlar/tedarikci-yonetimi', destination: '/dashboard/suppliers' },
      { source: '/dashboard/tanimlar/gider-kategorileri', destination: '/dashboard/definitions/expense-categories' },
      { source: '/dashboard/tanimlar/enflasyon-verileri', destination: '/dashboard/settings/inflation' },

      // Operasyonlar
      { source: '/dashboard/operasyonlar/siparis-yonetimi', destination: '/dashboard/orders' },
      { source: '/dashboard/operasyonlar/mal-girisi', destination: '/dashboard/goods-receipts' },
      { source: '/dashboard/operasyonlar/uretim-partileri', destination: '/dashboard/production-batches' },
      { source: '/dashboard/operasyonlar/stok-durumu', destination: '/dashboard/stok-durumu' },
      
      // Muhasebe
      { source: '/dashboard/muhasebe/cari-hesaplar-musteri', destination: '/dashboard/accounting/current-accounts' },
      { source: '/dashboard/muhasebe/cari-hesaplar-tedarikci', destination: '/dashboard/accounting/suppliers' },
      { source: '/dashboard/muhasebe/faturalar', destination: '/dashboard/accounting/invoices' },
      { source: '/dashboard/muhasebe/kasa-banka-hareketleri', destination: '/dashboard/accounting/payments' },
      { source: '/dashboard/muhasebe/gider-yonetimi', destination: '/dashboard/accounting/expenses' },

      // Raporlar
      { source: '/dashboard/raporlar/kar-zarar-analizi', destination: '/dashboard/reports/profitability' },
      
      // Sistem
      { source: '/dashboard/sistem/kullanici-yonetimi', destination: '/dashboard/user-management' },

      // Dinamik Rotalar (ID içerenler)
      { source: '/dashboard/operasyonlar/uretim-partileri/:id', destination: '/dashboard/production-batches/:id' },
      { source: '/dashboard/muhasebe/cari-hesaplar-musteri/:customerId', destination: '/dashboard/accounting/current-accounts/:customerId' },
      { source: '/dashboard/muhasebe/cari-hesaplar-tedarikci/:supplierId', destination: '/dashboard/accounting/suppliers/:supplierId' },
      { source: '/dashboard/muhasebe/faturalar/:invoiceId', destination: '/dashboard/accounting/invoices/:invoiceId' },
    ];
  },
};

export default nextConfig;