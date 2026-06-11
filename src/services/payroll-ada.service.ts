import { supabase } from '@/lib/supabase'
import type { ServiceResponse, PaginatedResponse } from '@/types/response.types'
import type {
  PayrollAda,
  ListPayrollAdasParams,
  PayrollAdaWithDetails,
} from '@/types/payroll-ada.types'
import { mapPayrollAda, mapPayrollAdaWithDetails } from '@/helpers/payroll-ada.helper'

// ──── Get All ─────────────────────────────────────────────────────────────────

export async function getAllPayrollAdas(): Promise<ServiceResponse<PayrollAda[]>> {
  const { data, error } = await supabase
    .from('t_payroll_ada')
    .select('*')
    .order('ada_date', { ascending: false })

  return { data: (data ?? []).map(mapPayrollAda), error }
}

// ─── Get By ID ────────────────────────────────────────────────────────────────

export async function getPayrollAdaById(id: number): Promise<ServiceResponse<PayrollAda | null>> {
  const { data, error } = await supabase
    .from('t_payroll_ada')
    .select('*')
    .eq('ada_id', id)
    .maybeSingle()

  return { data: data ? mapPayrollAda(data) : null, error }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createPayrollAda(
  payload: Omit<PayrollAda, 'ada_id' | 'ada_number' | 'created_at' | 'updated_at'>,
): Promise<ServiceResponse<PayrollAda>> {
  const { data, error } = await supabase
    .from('t_payroll_ada')
    .insert({
      ...payload,
      ada_number: 'AUTO',
    })
    .select()
    .single()

  return { data: data ? mapPayrollAda(data) : (null as unknown as PayrollAda), error }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updatePayrollAda(
  id: number,
  updates: Partial<Omit<PayrollAda, 'ada_id' | 'ada_number' | 'created_at' | 'updated_at'>>,
): Promise<ServiceResponse<PayrollAda>> {
  const { data, error } = await supabase
    .from('t_payroll_ada')
    .update(updates)
    .eq('ada_id', id)
    .select()
    .single()

  return { data: data ? mapPayrollAda(data) : (null as unknown as PayrollAda), error }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deletePayrollAda(id: number): Promise<ServiceResponse<null>> {
  const { error } = await supabase.from('t_payroll_ada').delete().eq('ada_id', id)
  return { data: null, error }
}

// ─── List (Paginated + Date Filter) ──────────────────────────────────────────

export async function listPayrollAdas({
  page = 1,
  pageSize = 10,
  payroll_period_id = null,
  bank_account_id = null,
  status = null,
}: ListPayrollAdasParams = {}): Promise<PaginatedResponse<PayrollAdaWithDetails>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('v_payroll_ada')
    .select(
      `*,
      period:l_payroll_period(cutoff_start, cutoff_end),
      bank_account:bank_accounts(
        fund_source,
        bank:l_banks(bank_abbreviation)
      )
      `,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (payroll_period_id) query = query.eq('payroll_period_id', payroll_period_id)
  if (bank_account_id) query = query.eq('bank_account_id', bank_account_id)
  if (status) query = query.eq('status', status)

  const { data, count, error } = await query

  if (error) return { data: [], count: 0, error }

  const rows: PayrollAdaWithDetails[] = (data ?? []).map(mapPayrollAdaWithDetails)

  return { data: rows, count: count ?? 0, error: null }
}
