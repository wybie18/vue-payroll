import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'
import { guestRoutes } from './guest'
import { authRoutes } from './auth'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...guestRoutes,
    ...authRoutes,
    {
      path: '/',
      redirect: '/login',
    },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

router.beforeEach(async (to, from) => {
  NProgress.start()
  const isInvite = window.location.hash.includes('type=invite') || to.hash.includes('type=invite')

  const authStore = useAuthStore()

  if (!authStore.session && !authStore.loading) {
    await authStore.initialize()
  }

  const isAuthenticated = authStore.isAuthenticated

  if (isInvite && to.name !== 'SetupAccount') {
    window.location.hash = ''
    return { name: 'SetupAccount' }
  }

  if (isAuthenticated && to.name !== 'SetupAccount') {
    if (!authStore.isProfileComplete) {
      return { name: 'SetupAccount' }
    }
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    return { name: 'Dashboard' }
  }

  return true
})

router.afterEach(() => {
  NProgress.done()
})

export default router
