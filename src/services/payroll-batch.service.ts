import { supabase } from '@/lib/supabase'
import type { ServiceResponse, PaginatedResponse } from '@/types/response.types'
import type {
  PayrollBatch,
  ListPayrollBatchesParams,
  PayrollBatchWithRelations,
} from '@/types/payroll-batch.types'
import { mapPayrollBatch, mapPayrollBatchesWithRelations } from '@/helpers/payroll-batch.helper'

// ──── Get All ─────────────────────────────────────────────────────────────────

export async function getAllPayrollBatches(): Promise<ServiceResponse<PayrollBatch[]>> {
  const { data, error } = await supabase
    .from('t_payroll_batches')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: (data ?? []).map(mapPayrollBatch), error }
}

// ──── Get All With No ADA ─────────────────────────────────────────────────────
export async function getPayrollBatchesWithNoAda(
  bankAccountId: number,
): Promise<ServiceResponse<PayrollBatch[]>> {
  const { data, error } = await supabase
    .from('v_unassigned_payroll_batches')
    .select('*')
    .eq('bank_account_id', bankAccountId)
    .order('created_at', { ascending: false })

  return { data: (data ?? []).map(mapPayrollBatch), error }
}

// ─── Get By ID ────────────────────────────────────────────────────────────────

export async function getPayrollBatchById(
  id: number,
): Promise<ServiceResponse<PayrollBatch | null>> {
  const { data, error } = await supabase
    .from('t_payroll_batches')
    .select('*')
    .eq('batch_id', id)
    .maybeSingle()

  return { data: data ? mapPayrollBatch(data) : null, error }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createPayrollBatch(
  payload: Omit<PayrollBatch, 'batch_id' | 'batch_code' | 'created_at' | 'updated_at' | 'status'>,
): Promise<ServiceResponse<PayrollBatch>> {
  const { data, error } = await supabase
    .from('t_payroll_batches')
    .insert({
      ...payload,
      batch_code: 'AUTO',
    })
    .select()
    .single()

  return { data: data ? mapPayrollBatch(data) : (null as unknown as PayrollBatch), error }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updatePayrollBatch(
  id: number,
  updates: Partial<Omit<PayrollBatch, 'batch_id' | 'created_at' | 'updated_at' | 'status'>>,
): Promise<ServiceResponse<PayrollBatch>> {
  const { data, error } = await supabase
    .from('t_payroll_batches')
    .update(updates)
    .eq('batch_id', id)
    .select()
    .single()

  return { data: data ? mapPayrollBatch(data) : (null as unknown as PayrollBatch), error }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deletePayrollBatch(id: number): Promise<ServiceResponse<null>> {
  const { error } = await supabase.from('t_payroll_batches').delete().eq('batch_id', id)
  return { data: null, error }
}

// ─── List (Paginated + Filter) ────────────────────────────────────────────────

export async function listPayrollBatches({
  page = 1,
  pageSize = 10,
  payroll_period_id = null,
  office_id = null,
  bank_account_id = null,
  status = null,
}: ListPayrollBatchesParams = {}): Promise<PaginatedResponse<PayrollBatchWithRelations>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('v_payroll_batches')
    .select(
      `*,
      period:l_payroll_period(cutoff_start, cutoff_end)
      `,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (payroll_period_id) query = query.eq('payroll_period_id', payroll_period_id)
  if (office_id) query = query.eq('office_id', office_id)
  if (bank_account_id) query = query.eq('bank_account_id', bank_account_id)
  if (status) query = query.eq('status', status)

  const { data, count, error } = await query

  if (error) return { data: [], count: 0, error }

  const rows: PayrollBatchWithRelations[] = (data ?? []).map(mapPayrollBatchesWithRelations).flat()

  return { data: rows, count: count ?? 0, error: null }
}
