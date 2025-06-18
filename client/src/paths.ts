// Dosya Yolu: client/src/paths.ts
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
    suppliers: '/dashboard/suppliers', // BU SATIR EKLENDİ
  },
  errors: { notFound: '/errors/not-found' },
} as const;