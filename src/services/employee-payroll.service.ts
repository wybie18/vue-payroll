import { supabase } from '@/lib/supabase'
import type { ServiceResponse, PaginatedResponse } from '@/types/response.types'
import type {
  EmployeePayroll,
  EmployeePayrollWithEmployee,
  ListEmployeePayrollsParams,
} from '@/types/employee-payroll.types'
import { mapEmployeePayroll } from '@/helpers/employee-payroll.helper'

// ──── Get All ─────────────────────────────────────────────────────────────────

export async function getAllEmployeePayrolls(
  batch_id: number,
): Promise<ServiceResponse<EmployeePayroll[]>> {
  const { data, error } = await supabase
    .from('t_employee_payroll')
    .select('*')
    .eq('batch_id', batch_id)
    .order('created_at', { ascending: false })

  return { data: (data ?? []).map(mapEmployeePayroll), error }
}

// ─── Get By ID ────────────────────────────────────────────────────────────────

export async function getEmployeePayrollById(
  id: number,
): Promise<ServiceResponse<EmployeePayroll | null>> {
  const { data, error } = await supabase
    .from('t_employee_payroll')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  return { data: data ? mapEmployeePayroll(data) : null, error }
}

// ─── Import ───────────────────────────────────────────────────────────────────

export async function importEmployeePayroll(
  batch_id: number,
  payload: Omit<EmployeePayroll, 'id' | 'batch_id' | 'created_at' | 'updated_at'>[],
): Promise<ServiceResponse<EmployeePayroll[]>> {
  const { data, error } = await supabase
    .from('t_employee_payroll')
    .insert(payload.map((row) => ({ ...row, batch_id })))
    .select()

  return { data: (data ?? []).map(mapEmployeePayroll), error }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createEmployeePayroll(
  batch_id: number,
  payload: Omit<EmployeePayroll, 'id' | 'batch_id' | 'created_at' | 'updated_at'>,
): Promise<ServiceResponse<EmployeePayroll>> {
  const { data, error } = await supabase
    .from('t_employee_payroll')
    .insert({ ...payload, batch_id })
    .select()
    .single()

  return { data: data ? mapEmployeePayroll(data) : (null as unknown as EmployeePayroll), error }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateEmployeePayroll(
  batch_id: number,
  id: number,
  updates: Partial<Omit<EmployeePayroll, 'id' | 'batch_id' | 'created_at' | 'updated_at'>>,
): Promise<ServiceResponse<EmployeePayroll>> {
  const { data, error } = await supabase
    .from('t_employee_payroll')
    .update(updates)
    .eq('id', id)
    .eq('batch_id', batch_id)
    .select()
    .single()

  return { data: data ? mapEmployeePayroll(data) : (null as unknown as EmployeePayroll), error }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteEmployeePayroll(id: number): Promise<ServiceResponse<null>> {
  const { error } = await supabase.from('t_employee_payroll').delete().eq('id', id)
  return { data: null, error }
}

// ─── List (Paginated + Filter) ────────────────────────────────────────────────

export async function listEmployeePayrolls({
  page = 1,
  pageSize = 10,
  batch_id,
}: ListEmployeePayrollsParams): Promise<PaginatedResponse<EmployeePayrollWithEmployee>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('t_employee_payroll')
    .select('*, employee:t_employee_accounts(name, account_no, employee_no, eenggas_no)', {
      count: 'exact',
    })
    .eq('batch_id', batch_id)
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, count, error } = await query

  if (error) return { data: [], count: 0, error }

  const rows: EmployeePayrollWithEmployee[] = (data ?? []).map(mapEmployeePayroll)

  return { data: rows, count: count ?? 0, error: null }
}
