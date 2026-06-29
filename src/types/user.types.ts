import type { Database } from './database.types'

export type UserProfile = Database['public']['Tables']['profiles']['Row']

export type Role = Database['public']['Tables']['l_roles']['Row']

export type UserProfileWithRole = UserProfile & {
  role: Omit<Role, 'created_at'>
}

// ─── Role Enum ────────────────────────────────────────────────────────────────

/**
 * Maps role names to their database IDs in the `l_roles` table.
 * Keep in sync with the database — add new entries here when new roles are created.
 */
export enum UserRole {
  ADMIN = 1,
  ACCOUNTING = 2,
  CASHIER_LBP = 3,
  CASHIER_DBP = 4,
}

export type UserRoleType = UserRole | UserRole[]
