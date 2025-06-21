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
    // "settings" buradan kaldırıldı.
  },
  errors: { notFound: '/errors/not-found' },
} as const;