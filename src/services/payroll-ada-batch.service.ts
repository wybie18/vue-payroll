import { supabase } from '@/lib/supabase'
import type { ServiceResponse, PaginatedResponse } from '@/types/response.types'
import type { PayrollAdaBatch, PayrollAdaBatchWithRelations } from '@/types/payroll-ada-batch.types'
import {
  mapPayrollAdaBatch,
  mapPayrollAdaBatchWithRelations,
} from '@/helpers/payroll-ada-batch.helper'

// ──── Get By ADA ──────────────────────────────────────────────────────────────

export async function listAdaBatches(
  page = 1,
  pageSize = 10,
  adaId: number,
): Promise<PaginatedResponse<PayrollAdaBatchWithRelations>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await supabase
    .from('v_ada_batches')
    .select('*', { count: 'exact' })
    .eq('ada_id', adaId)
    .order('assigned_at', { ascending: false })
    .range(from, to)

  if (error) return { data: [], count: 0, error }

  return {
    data: (data ?? []).map(mapPayrollAdaBatchWithRelations),
    count: count ?? 0,
    error: null,
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createAdaBatch(
  adaId: number,
  payload: Omit<PayrollAdaBatch, 'id' | 'ada_id' | 'created_at' | 'updated_at'>,
): Promise<ServiceResponse<PayrollAdaBatch>> {
  const { data, error } = await supabase
    .from('t_payroll_ada_batches')
    .insert({ ...payload, ada_id: adaId })
    .select()
    .single()

  return { data: data ? mapPayrollAdaBatch(data) : (null as unknown as PayrollAdaBatch), error }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteAdaBatch(id: number): Promise<ServiceResponse<null>> {
  const { error } = await supabase.from('t_payroll_ada_batches').delete().eq('id', id)
  return { data: null, error }
}
