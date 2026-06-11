import type { RouteRecordRaw } from 'vue-router'

export const guestRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/guest/Login.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/setup-account',
    name: 'SetupAccount',
    component: () => import('@/views/guest/SetupAccount.vue'),
    meta: { requiresAuth: true },
  },
]
