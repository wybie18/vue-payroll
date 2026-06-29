import { supabase } from '@/lib/supabase'
import type { ServiceResponse } from '@/types/response.types'
import type { UserProfile, UserProfileWithRole } from '@/types/user.types'
import type { AuthError, Session, User } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthResponse<T = null> {
  data: T
  error: AuthError | null
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signInWithEmail(
  credentials: AuthCredentials,
): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })

  return { data, error }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<AuthResponse> {
  const { error } = await supabase.auth.signOut()
  return { data: null, error }
}

// ─── Get Session ──────────────────────────────────────────────────────────────

export async function getSession(): Promise<AuthResponse<Session | null>> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  return { data: session, error }
}

// ─── Get Current User ─────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<AuthResponse<User | null>> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  return { data: user, error }
}

export async function getUserProfile(userId: string): Promise<ServiceResponse<UserProfileWithRole | null>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, role:l_roles!role_id(id, role_name)')
    .eq('id', userId)
    .maybeSingle()

  return { data: data as UserProfileWithRole | null, error }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<ServiceResponse<UserProfileWithRole | null>> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('*, role:l_roles!role_id(id, role_name)')
    .single()

  return { data: data as UserProfileWithRole | null, error }
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetOtp(email: string): Promise<AuthResponse> {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  return { data: null, error }
}

export async function verifyPasswordResetOtp(
  email: string,
  token: string,
): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })
  return { data, error }
}

export async function resetPasswordWithOtp(
  email: string,
  token: string,
  newPassword: string,
): Promise<AuthResponse<User | null>> {
  // First verify OTP to establish a session
  const { data: verifyData, error: verifyError } = await verifyPasswordResetOtp(email, token)
  if (verifyError) return { data: null, error: verifyError }

  // Now update the password using the established session
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  return { data: data.user ?? null, error }
}

// ─── Update Password ──────────────────────────────────────────────────────────

export async function updatePassword(newPassword: string): Promise<AuthResponse<User | null>> {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  return { data: data.user ?? null, error }
}

// ─── Setup Invited User ───────────────────────────────────────────────────────

export async function setupInvitedUser(
  password: string,
  profileData: Partial<UserProfile>,
): Promise<AuthResponse<User | null>> {
  const { data, error: authError } = await supabase.auth.updateUser({
    password: password,
    data: profileData,
  })

  if (authError) return { data: null, error: authError }

  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', data.user.id)

    if (profileError) {
      console.error('Failed to update public profile:', profileError)
    }
  }

  return { data: data.user ?? null, error: null }
}

// ─── Auth State Listener ──────────────────────────────────────────────────────

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}
