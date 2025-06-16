// client/src/paths.ts

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
    // --- YENİ EKLENEN KISIM ---
    nurseryDefinitions: {
      list: '/dashboard/nursery-definitions',
      plantTypes: '/dashboard/nursery-definitions/plant-types',
      // Diğerlerini daha sonra ekleyeceğiz:
      // plantVarieties: '/dashboard/nursery-definitions/plant-varieties',
      // rootstocks: '/dashboard/nursery-definitions/rootstocks', 
    },
    // -------------------------
  },
  errors: { notFound: '/errors/not-found' },
} as const;