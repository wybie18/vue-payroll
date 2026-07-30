import { supabase } from '@/lib/supabase'
import type { ServiceResponse, PaginatedResponse } from '@/types/response.types'
import type { PayrollPeriod, ListPayrollPeriodsParams } from '@/types/payroll-period.types'
import { mapPayrollPeriod } from '@/helpers/payroll-period.helper'

// ──── Get All ─────────────────────────────────────────────────────────────────
export async function getAllPayrollPeriods(): Promise<ServiceResponse<PayrollPeriod[]>> {
  const { data, error } = await supabase
    .from('l_payroll_period')
    .select('*')
    .order('cutoff_start', { ascending: false })

  return { data: (data ?? []).map(mapPayrollPeriod), error }
}

// ─── Get By ID ────────────────────────────────────────────────────────────────

export async function getPayrollPeriodById(id: number): Promise<ServiceResponse<PayrollPeriod | null>> {
  const { data, error } = await supabase
    .from('l_payroll_period')
    .select('*')
    .eq('payroll_period_id', id)
    .maybeSingle()

  return { data: data ? mapPayrollPeriod(data) : null, error }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createPayrollPeriod(
  payload: Omit<PayrollPeriod, 'payroll_period_id' | 'created_at' | 'updated_at'>,
): Promise<ServiceResponse<PayrollPeriod>> {
  const { data, error } = await supabase.from('l_payroll_period').insert(payload).select().single()

  return { data: data ? mapPayrollPeriod(data) : (null as unknown as PayrollPeriod), error }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updatePayrollPeriod(
  id: number,
  updates: Partial<Omit<PayrollPeriod, 'payroll_period_id' | 'created_at' | 'updated_at'>>,
): Promise<ServiceResponse<PayrollPeriod>> {
  const { data, error } = await supabase
    .from('l_payroll_period')
    .update(updates)
    .eq('payroll_period_id', id)
    .select()
    .single()

  return { data: data ? mapPayrollPeriod(data) : (null as unknown as PayrollPeriod), error }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deletePayrollPeriod(id: number): Promise<ServiceResponse<null>> {
  const { error } = await supabase.from('l_payroll_period').delete().eq('payroll_period_id', id)
  return { data: null, error }
}

// ─── List (Paginated + Date Filter) ──────────────────────────────────────────

export async function listPayrollPeriods({
  page = 1,
  pageSize = 10,
  startDate = null,
  endDate = null,
  compensation_type = null,
  search = '',
}: ListPayrollPeriodsParams = {}): Promise<PaginatedResponse<PayrollPeriod>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('l_payroll_period')
    .select('*', { count: 'exact' })
    .order('cutoff_start', { ascending: false })
    .range(from, to)

  if (startDate) {
    query = query.gte('cutoff_start', startDate)
  }

  if (endDate) {
    query = query.lte('cutoff_end', endDate)
  }

  if (compensation_type) {
    query = query.eq('compensation_type', compensation_type)
  }

  if (search && search.trim()) {
    query = query.ilike('description', `%${search.trim()}%`)
  }

  const { data, count, error } = await query

  if (error) return { data: [], count: 0, error }

  const rows: PayrollPeriod[] = (data ?? []).map(mapPayrollPeriod)

  return { data: rows, count: count ?? 0, error: null }
}
