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
    settings: '/dashboard/settings',
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
    // --- YENİ RAPOR ROTALARI ---
    reports: {
      overview: '/dashboard/reports',
      // Finansal
      financial: {
        realProfitability: '/dashboard/reports/financial/real-profitability',
        profitability: '/dashboard/reports/profitability',
        cashFlow: '/dashboard/reports/financial/cash-flow',
        expenseAnalysis: '/dashboard/reports/financial/expense-analysis',
        receivablesAging: '/dashboard/reports/financial/receivables-aging',
      },
      // Satış
      sales: {
        detailedSales: '/dashboard/reports/sales/detailed-sales',
        salesByCustomer: '/dashboard/reports/sales/by-customer',
        salesByProduct: '/dashboard/reports/sales/by-product',
      },
      // Stok
      inventory: {
        valuation: '/dashboard/reports/inventory/valuation',
        stockMovements: '/dashboard/reports/inventory/movements',
        stockAging: '/dashboard/reports/inventory/aging',
      },
    },
  },
  errors: { notFound: '/errors/not-found' },
} as const;