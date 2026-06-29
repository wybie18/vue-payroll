import 'vue-router'
import type { UserRoleType } from '@/types/user.types'

declare module 'vue-router' {
  interface RouteMeta {
    layout?: string
    requiresAuth?: boolean
    requiresGuest?: boolean
    roles?: UserRole[]
  }
}
