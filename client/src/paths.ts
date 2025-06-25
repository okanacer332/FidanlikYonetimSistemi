export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    userManagement: '/dashboard/user-management',
    plants: '/dashboard/plants',
    warehouses: '/dashboard/warehouses',
    suppliers: '/dashboard/suppliers',
    goodsReceipts: '/dashboard/goods-receipts',
    orders: '/dashboard/orders',
    accounting: {
      currentAccounts: '/dashboard/accounting/current-accounts',
      suppliers: '/dashboard/accounting/suppliers', // DÜZELTME: Bu satır eksikti.
      invoices: '/dashboard/accounting/invoices',
      payments: '/dashboard/accounting/payments',
      expenses: '/dashboard/accounting/expenses',
    },
   reports: {
       overview: '/dashboard/reports', // Mevcut raporlar sayfanız
       profitability: '/dashboard/reports/profitability' // YENİ EKLENDİ
    }
  },
  errors: { notFound: '/errors/not-found' },
} as const;