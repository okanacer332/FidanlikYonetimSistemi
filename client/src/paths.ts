// client/src/paths.ts
export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    goodsReceipts: '/dashboard/goods-receipts',
    integrations: '/dashboard/integrations',
    orders: '/dashboard/orders',
    plants: '/dashboard/plants',
    settings: {
      root: '/dashboard/settings',
      inflation: '/dashboard/settings/inflation',
    },
    suppliers: '/dashboard/suppliers',
    userManagement: '/dashboard/user-management',
    warehouses: '/dashboard/warehouses',
    accounting: {
      currentAccounts: '/dashboard/accounting/current-accounts',
      suppliers: '/dashboard/accounting/suppliers',
      invoices: '/dashboard/accounting/invoices',
      payments: '/dashboard/accounting/payments',
      expenses: '/dashboard/accounting/expenses',
    },
    reports: {
      overview: '/dashboard/reports',
      financial: {
        profitability: '/dashboard/reports/profitability',
        cashFlow: '/dashboard/reports/financial/cash-flow',
        expenseAnalysis: '/dashboard/reports/financial/expense-analysis',
        receivablesAging: '/dashboard/reports/financial/receivables-aging',
      },
      sales: {
        detailedSales: '/dashboard/reports/sales/detailed-sales',
        salesByCustomer: '/dashboard/reports/sales/by-customer',
        salesByProduct: '/dashboard/reports/sales/by-product',
      },
      inventory: {
        valuation: '/dashboard/reports/inventory/valuation',
        stockMovements: '/dashboard/reports/inventory/movements',
        stockAging: '/dashboard/reports/inventory/aging',
      },
    },
    // Yeni eklenen stok durumu yolu (Operasyonlar altında olacağı için direkt dashboard altında)
    stockStatus: '/dashboard/stok-durumu', // <-- Bu satırı ekle
  },
  errors: { notFound: '/errors/not-found' },
} as const;