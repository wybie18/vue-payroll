import { supabase } from '@/lib/supabase'
import type { ServiceResponse, PaginatedResponse } from '@/types/response.types'
import type { Employee, ListEmployeesParams } from '@/types/employee.types'
import { mapEmployee } from '@/helpers/employee.helper'

// ─── Get All Employees ────────────────────────────────────────────────────────

export async function getAllEmployees(): Promise<ServiceResponse<Employee[]>> {
  const { data, error } = await supabase.from('t_employee_accounts').select('*')

  return { data: data ? data.map(mapEmployee) : [], error }
}

// ─── Get By ID ────────────────────────────────────────────────────────────────

export async function getEmployeeById(id: number): Promise<ServiceResponse<Employee | null>> {
  const { data, error } = await supabase
    .from('t_employee_accounts')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  return { data: data ? mapEmployee(data) : null, error }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createEmployee(
  payload: Omit<Employee, 'id' | 'created_at' | 'updated_at'>,
): Promise<ServiceResponse<Employee>> {
  const { data, error } = await supabase
    .from('t_employee_accounts')
    .insert(payload)
    .select()
    .single()

  return { data: data ? mapEmployee(data) : (null as unknown as Employee), error }
}

export async function importEmployees(
  payload: Omit<Employee, 'id' | 'created_at' | 'updated_at'>[],
): Promise<ServiceResponse<Employee[]>> {
  const { data, error } = await supabase.from('t_employee_accounts').insert(payload).select()

  return { data: data ? data.map(mapEmployee) : [], error }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateEmployee(
  id: number,
  updates: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>,
): Promise<ServiceResponse<Employee>> {
  const { data, error } = await supabase
    .from('t_employee_accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data: data ? mapEmployee(data) : (null as unknown as Employee), error }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteEmployee(id: number): Promise<ServiceResponse<null>> {
  const { error } = await supabase.from('t_employee_accounts').delete().eq('id', id)
  return { data: null, error }
}

// ─── List (Paginated + Search + Filter) ──────────────────────────────────────

export async function listEmployees({
  page = 1,
  pageSize = 10,
  search = '',
  officeId = null,
  status = null,
}: ListEmployeesParams = {}): Promise<PaginatedResponse<Employee>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('t_employee_accounts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search.trim()) {
    query = query.or(
      `name.ilike.%${search.trim()}%,employee_no.ilike.%${search.trim()}%,eenggas_no.ilike.%${search.trim()}%`,
    )
  }

  if (officeId) {
    query = query.eq('office_id', officeId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query

  if (error) return { data: [], count: 0, error }

  const rows: Employee[] = (data ?? []).map(mapEmployee)

  return { data: rows, count: count ?? 0, error: null }
}
