// Konum: src/paths.ts
export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    // Ana Rotalar
    overview: '/dashboard',
    account: '/dashboard/profilim',

    // Tanımlar Grubu (Yeniden Yapılandırıldı ve Türkçeleştirildi)
    tanimlar: {
      plants: '/dashboard/tanimlar/fidan-yonetimi',
      warehouses: '/dashboard/tanimlar/depo-yonetimi',
      customers: '/dashboard/tanimlar/musteri-yonetimi',
      suppliers: '/dashboard/tanimlar/tedarikci-yonetimi',
      expenseCategories: '/dashboard/tanimlar/gider-kategorileri',
      inflationData: '/dashboard/tanimlar/enflasyon-verileri',
    },

    // Operasyonlar Grubu (Türkçeleştirildi)
    operasyonlar: {
      orders: '/dashboard/operasyonlar/siparis-yonetimi',
      goodsReceipts: '/dashboard/operasyonlar/mal-girisi',
      productionBatches: '/dashboard/operasyonlar/uretim-partileri',
      productionBatchesDetails: (id: string) => `/dashboard/operasyonlar/uretim-partileri/${id}`,
      stockStatus: '/dashboard/operasyonlar/stok-durumu',
    },
    
    // Muhasebe Grubu (Türkçeleştirildi)
    muhasebe: {
      currentAccounts: '/dashboard/muhasebe/cari-hesaplar-musteri',
      currentAccountDetails: (customerId: string) => `/dashboard/muhasebe/cari-hesaplar-musteri/${customerId}`,
      suppliers: '/dashboard/muhasebe/cari-hesaplar-tedarikci',
      supplierDetails: (supplierId: string) => `/dashboard/muhasebe/cari-hesaplar-tedarikci/${supplierId}`,
      invoices: '/dashboard/muhasebe/faturalar',
      invoiceDetails: (invoiceId: string) => `/dashboard/muhasebe/faturalar/${invoiceId}`,
      payments: '/dashboard/muhasebe/kasa-banka-hareketleri',
      expenses: '/dashboard/muhasebe/gider-yonetimi',
    },
    
    // Raporlar Grubu (Türkçeleştirildi)
    raporlar: {
      profitability: '/dashboard/raporlar/kar-zarar-analizi',
    },
    
    // Sistem Grubu (Türkçeleştirildi)
    sistem: {
      userManagement: '/dashboard/sistem/kullanici-yonetimi',
    },
  },
  errors: { notFound: '/errors/not-found' },
} as const;