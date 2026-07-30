import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Session } from '@supabase/supabase-js'
import {
  signInWithEmail,
  signOut,
  getSession,
  onAuthStateChange,
  sendPasswordResetOtp,
  resetPasswordWithOtp,
  updatePassword,
  setupInvitedUser,
  getUserProfile,
  updateUserProfile,
} from '@/services/auth.service'
import type { UserProfile, UserProfileWithRole } from '@/types/user.types'
import { UserRole } from '@/types/user.types'
import type { UserRoleType } from '@/types/user.types'

export const useAuthStore = defineStore('auth', () => {
  // ─── State ─────────────────────────────────────────────────────────────────

  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const profile = ref<UserProfileWithRole | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ─── Getters ───────────────────────────────────────────────────────────────

  const isAuthenticated = computed(() => !!session.value && !!user.value)
  const userEmail = computed(() => user.value?.email ?? null)
  const userId = computed(() => user.value?.id ?? null)

  const isProfileComplete = computed(() => {
    const p = profile.value

    if (!p) return false

    return Boolean(p.first_name && p.last_name && p.phone_number)
  })

  // ─── Role Getters ─────────────────────────────────────────────────────────

  const userRole = computed(() => profile.value?.role ?? null)
  const userRoleId = computed(() => profile.value?.role_id ?? null)

  const isAdmin = computed(() => userRoleId.value === UserRole.ADMIN)
  const isAccounting = computed(() => userRoleId.value === UserRole.ACCOUNTING)
  const isCashierLBP = computed(() => userRoleId.value === UserRole.CASHIER_LBP)
  const isCashierDBP = computed(() => userRoleId.value === UserRole.CASHIER_DBP)

  /**
   * Check if the current user has a specific role or one of several roles.
   * @param roleIds - A single UserRole or an array of UserRole values.
   */
  function userHasRole(roleIds: UserRoleType): boolean {
    const currentRoleId = userRoleId.value
    if (currentRoleId === null) return false

    if (Array.isArray(roleIds)) {
      return roleIds.includes(currentRoleId)
    }

    return currentRoleId === roleIds
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function clearError() {
    error.value = null
  }

  async function setAuthData(newUser: User | null, newSession: Session | null) {
    const isSameUser = !!newUser && newUser.id === user.value?.id

    user.value = newUser
    session.value = newSession

    if (newUser) {
      if (!isSameUser || !profile.value) {
        await fetchUserProfile(newUser.id)
      }
    } else {
      profile.value = null
    }
  }

  async function fetchUserProfile(uid: string) {
    const { data, error: profileError } = await getUserProfile(uid)

    if (profileError) {
      profile.value = null
      return
    }

    profile.value = data || null
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  async function initialize() {
    loading.value = true
    try {
      const { data: currentSession, error: sessionError } = await getSession()
      if (sessionError) throw sessionError

      if (currentSession) {
        await setAuthData(currentSession.user, currentSession)
      }

      onAuthStateChange(async (event, newSession) => {
        await setAuthData(newSession?.user ?? null, newSession)
      })
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    clearError()
    try {
      const { data, error: authError } = await signInWithEmail({ email, password })
      if (authError) throw authError

      await setAuthData(data.user, data.session)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    clearError()
    try {
      const { error: authError } = await signOut()
      if (authError) throw authError
      setAuthData(null, null)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function sendResetOtp(email: string) {
    loading.value = true
    clearError()
    try {
      const { error: authError } = await sendPasswordResetOtp(email)
      if (authError) throw authError
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function resetPasswordViaOtp(email: string, token: string, newPassword: string) {
    loading.value = true
    clearError()
    try {
      const { data: updatedUser, error: authError } = await resetPasswordWithOtp(
        email,
        token,
        newPassword,
      )
      if (authError) throw authError
      await signOut()
      user.value = null
      session.value = null
      profile.value = null
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function changePassword(newPassword: string) {
    loading.value = true
    clearError()
    try {
      const { data: updatedUser, error: authError } = await updatePassword(newPassword)
      if (authError) throw authError
      user.value = updatedUser
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function setupAccount(password: string, profileData: Partial<UserProfile>) {
    loading.value = true
    clearError()
    try {
      const { data: updatedUser, error: authError } = await setupInvitedUser(password, profileData)
      if (authError) throw authError

      user.value = updatedUser

      if (updatedUser) {
        await fetchUserProfile(updatedUser.id)
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProfileInfo(updates: Partial<UserProfile>) {
    loading.value = true
    clearError()
    try {
      if (!user.value) throw new Error('Not logged in')
      const { data, error: profileError } = await updateUserProfile(user.value.id, updates)
      if (profileError) throw profileError

      profile.value = data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // state
    user,
    session,
    profile,
    loading,
    error,
    // getters
    isAuthenticated,
    userEmail,
    userId,
    isProfileComplete,
    // role getters
    userRole,
    userRoleId,
    isAdmin,
    isAccounting,
    isCashierLBP,
    isCashierDBP,
    userHasRole,
    // actions
    initialize,
    login,
    logout,
    sendResetOtp,
    resetPasswordViaOtp,
    changePassword,
    setupAccount,
    updateProfileInfo,
    clearError,
  }
})
