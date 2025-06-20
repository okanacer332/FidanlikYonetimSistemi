export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    userManagement: '/dashboard/user-management',
    plants: '/dashboard/plants',
    warehouses: '/dashboard/warehouses',
    suppliers: '/dashboard/suppliers',
    goodsReceipts: '/dashboard/goods-receipts', // This should already be here
    orders: '/dashboard/orders',             // ADD THIS LINE
  },
  errors: { notFound: '/errors/not-found' },
} as const;