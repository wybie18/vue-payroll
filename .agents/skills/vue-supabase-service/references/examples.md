# Vue + Supabase Service — Annotated Examples

## Table of Contents
1. [Response Types](#1-response-types)
2. [Domain Types](#2-domain-types)
3. [CRUD Service](#3-crud-service)
4. [Paginated List with Filters](#4-paginated-list-with-filters)
5. [RPC Calls](#5-rpc-calls)
6. [Auth Service](#6-auth-service)
7. [Helpers](#7-helpers)

---

## 1. Response Types

### `src/types/response.types.ts`
```ts
import type { PostgrestError } from '@supabase/supabase-js'

export interface ServiceResponse<T = null> {
  data: T
  error: PostgrestError | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  error: PostgrestError | null
}
```

### `src/types/auth.types.ts`
```ts
import type { AuthError } from '@supabase/supabase-js'

export interface AuthCredentials {
  email: string
  password: string
}

// AuthResponse is used exclusively for supabase.auth.* calls.
// For profile table reads/writes, use ServiceResponse instead.
export interface AuthResponse<T = null> {
  data: T
  error: AuthError | null
}
```

---

## 2. Domain Types

### `src/types/order.types.ts`
```ts
// One file per domain. Use plain interfaces — no classes.
// Nullable DB columns should be `| null`, not `| undefined`.

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  customer_id: string
  status: OrderStatus
  total_amount: number
  notes: string | null
  created_at: string
}

// Params for list/search functions live here too
export interface ListOrdersParams {
  page?: number
  pageSize?: number
  search?: string
  status?: OrderStatus | null
}

// Shapes that join across tables (e.g. from a view or RPC) get their own interface
export interface OrderWithCustomer extends Order {
  customer_name: string
  customer_email: string
}
```

---

## 3. CRUD Service

### `src/services/order.service.ts`
```ts
import { supabase } from '@/lib/supabase'
import type { ServiceResponse } from '@/types/response.types'
import type { Order } from '@/types/order.types'

// ─── Get By ID ────────────────────────────────────────────────────────────────

// Use maybeSingle() — it returns null instead of throwing when no row matches.
// Use single() only when you're certain the row exists (e.g. after insert).
export async function getOrderById(id: string): Promise<ServiceResponse<Order | null>> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  return { data, error }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createOrder(
  payload: Omit<Order, 'id' | 'created_at'>,
): Promise<ServiceResponse<Order>> {
  const { data, error } = await supabase
    .from('orders')
    .insert(payload)
    .select()
    .single()

  // single() is safe here because insert always returns the new row
  return { data, error }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateOrder(
  id: string,
  updates: Partial<Order>,
): Promise<ServiceResponse<Order>> {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteOrder(id: string): Promise<ServiceResponse<null>> {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  return { data: null, error }
}
```

---

## 4. Paginated List with Filters

### `src/services/order.service.ts` (continued)
```ts
import type { PaginatedResponse } from '@/types/response.types'
import type { Order, ListOrdersParams, OrderStatus } from '@/types/order.types'

// ─── List (Paginated + Search + Filter) ──────────────────────────────────────

export async function listOrders({
  page = 1,
  pageSize = 10,
  search = '',
  status = null,
}: ListOrdersParams = {}): Promise<PaginatedResponse<Order>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Build the base query first, then layer on filters.
  // Assigning back to `query` keeps TypeScript happy with the chained types.
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })  // count: 'exact' is required for pagination
    .order('created_at', { ascending: false })
    .range(from, to)

  // Apply optional filters conditionally
  if (search.trim()) {
    query = query.ilike('notes', `%${search.trim()}%`)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query

  // Always guard the error case — return an empty result, not null/undefined
  if (error) return { data: [], count: 0, error }

  // Map explicitly from raw DB rows to the typed shape.
  // Don't use `data as Order[]` — map field by field so the compiler catches mismatches.
  const rows: Order[] = (data ?? []).map((item: any) => ({
    id: item.id,
    customer_id: item.customer_id,
    status: item.status as OrderStatus,
    total_amount: item.total_amount,
    notes: item.notes,
    created_at: item.created_at,
  }))

  return { data: rows, count: count ?? 0, error: null }
}
```

**Using a database view for joined data:**
```ts
// If the query joins multiple tables, point at a view instead.
// The mapping pattern is identical.
export async function listOrdersWithCustomer({
  page = 1,
  pageSize = 10,
  search = '',
}: ListOrdersParams = {}): Promise<PaginatedResponse<OrderWithCustomer>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('orders_with_customer_view')   // <-- view name
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search.trim()) {
    query = query.or(
      `customer_name.ilike.%${search.trim()}%,customer_email.ilike.%${search.trim()}%`,
    )
  }

  const { data, count, error } = await query
  if (error) return { data: [], count: 0, error }

  const rows: OrderWithCustomer[] = (data ?? []).map((item: any) => ({
    id: item.id,
    customer_id: item.customer_id,
    status: item.status,
    total_amount: item.total_amount,
    notes: item.notes,
    created_at: item.created_at,
    customer_name: item.customer_name,
    customer_email: item.customer_email,
  }))

  return { data: rows, count: count ?? 0, error: null }
}
```

---

## 5. RPC Calls

RPC functions map directly to Postgres functions exposed via PostgREST.

### Scalar / single-row RPC
```ts
import { supabase } from '@/lib/supabase'
import type { ServiceResponse } from '@/types/response.types'

// ─── RPC: Get Order Summary ───────────────────────────────────────────────────

export interface OrderSummary {
  total_orders: number
  total_revenue: number
  avg_order_value: number
}

export async function getOrderSummary(
  customerId: string,
): Promise<ServiceResponse<OrderSummary | null>> {
  const { data, error } = await supabase.rpc('get_order_summary', {
    p_customer_id: customerId,   // param names must match the Postgres function signature
  })

  // RPC returns null when the function returns NULL — guard with ?? null
  return { data: data ?? null, error }
}
```

### Array-returning RPC (with count)
```ts
// When an RPC returns a table/set of rows, treat it like a list query.
// Note: RPC doesn't support { count: 'exact' } — handle count server-side
// or do a separate count call if needed.

export async function getTopCustomers(limit = 10): Promise<ServiceResponse<Customer[]>> {
  const { data, error } = await supabase.rpc('get_top_customers', {
    p_limit: limit,
  })

  if (error) return { data: [], error }

  const rows: Customer[] = (data ?? []).map((item: any) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    total_spent: item.total_spent,
  }))

  return { data: rows, error }
}
```

### RPC with no return value (side-effect only)
```ts
export async function archiveOldOrders(beforeDate: string): Promise<ServiceResponse<null>> {
  const { error } = await supabase.rpc('archive_orders_before', {
    p_before_date: beforeDate,
  })
  return { data: null, error }
}
```

---

## 6. Auth Service

### `src/services/auth.service.ts`
```ts
import { supabase } from '@/lib/supabase'
import type { ServiceResponse } from '@/types/response.types'
import type { AuthCredentials, AuthResponse } from '@/types/auth.types'
import type { UserProfile } from '@/types/user.types'
import type { Session, User } from '@supabase/supabase-js'

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

// ─── Session ──────────────────────────────────────────────────────────────────

export async function getSession(): Promise<AuthResponse<Session | null>> {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { data: session, error }
}

export async function getCurrentUser(): Promise<AuthResponse<User | null>> {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { data: user, error }
}

// ─── Profile (uses ServiceResponse, not AuthResponse) ─────────────────────────

export async function getUserProfile(userId: string): Promise<ServiceResponse<UserProfile | null>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return { data, error }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<ServiceResponse<UserProfile | null>> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
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
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  return { data, error }
}

export async function resetPasswordWithOtp(
  email: string,
  token: string,
  newPassword: string,
): Promise<AuthResponse<User | null>> {
  // Step 1: verify OTP to create a session
  const { error: verifyError } = await verifyPasswordResetOtp(email, token)
  if (verifyError) return { data: null, error: verifyError }

  // Step 2: update password using the new session
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  return { data: data.user ?? null, error }
}

// ─── Update Password ──────────────────────────────────────────────────────────

export async function updatePassword(newPassword: string): Promise<AuthResponse<User | null>> {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  return { data: data.user ?? null, error }
}

// ─── Setup Invited User ───────────────────────────────────────────────────────

// For users who were invited via Supabase invite flow:
// 1. Set their password in auth
// 2. Mirror profile data to the public profiles table
export async function setupInvitedUser(
  password: string,
  profileData: Partial<UserProfile>,
): Promise<AuthResponse<User | null>> {
  const { data, error: authError } = await supabase.auth.updateUser({
    password,
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
      // Don't surface this as a fatal error — auth succeeded; profile is a best-effort sync
    }
  }

  return { data: data.user ?? null, error: null }
}

// ─── Auth State Listener ──────────────────────────────────────────────────────

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void,
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}
```

---

## 7. Helpers

Helpers are pure functions — no Supabase imports allowed.

### `src/helpers/order.helper.ts`
```ts
import type { Order, OrderStatus } from '@/types/order.types'

// ─── Row Mapper ───────────────────────────────────────────────────────────────

// Use mappers when multiple service functions return the same shape.
// Pass the raw DB row (any) and get back the typed model.
export function mapOrder(item: any): Order {
  return {
    id: item.id,
    customer_id: item.customer_id,
    status: item.status as OrderStatus,
    total_amount: item.total_amount,
    notes: item.notes ?? null,
    created_at: item.created_at,
  }
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatOrderStatus(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return labels[status] ?? status
}

export function formatCurrency(amount: number, currency = 'PHP'): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
  }).format(amount)
}
```

### Using the mapper in a service
```ts
// In order.service.ts — import the mapper and use it in list/get functions
import { mapOrder } from '@/helpers/order.helper'

const rows: Order[] = (data ?? []).map(mapOrder)
```
