import { supabase } from '@/lib/supabase'
import type { ServiceResponse, PaginatedResponse } from '@/types/response.types'
import type { Office, ListOfficesParams } from '@/types/office.types'
import { mapOffice } from '@/helpers/office.helper'

// ──── Get All ─────────────────────────────────────────────────────────────────
export async function getAllOffices(): Promise<ServiceResponse<Office[]>> {
  const { data, error } = await supabase.from('l_offices').select('*').order('created_at', {
    ascending: false,
  })

  return { data: (data ?? []).map(mapOffice), error }
}

// ─── Get By ID ────────────────────────────────────────────────────────────────

export async function getOfficeById(id: number): Promise<ServiceResponse<Office | null>> {
  const { data, error } = await supabase
    .from('l_offices')
    .select('*')
    .eq('office_id', id)
    .maybeSingle()

  return { data: data ? mapOffice(data) : null, error }
}

// ─── Import ───────────────────────────────────────────────────────────────────
export async function importOffices(
  payload: Omit<Office, 'office_id' | 'created_at' | 'updated_at'>[],
): Promise<ServiceResponse<Office[]>> {
  const { data, error } = await supabase.from('l_offices').insert(payload).select()

  return { data: (data ?? []).map(mapOffice), error }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createOffice(
  payload: Omit<Office, 'office_id' | 'created_at' | 'updated_at'>,
): Promise<ServiceResponse<Office>> {
  const { data, error } = await supabase.from('l_offices').insert(payload).select().single()

  return { data: data ? mapOffice(data) : (null as unknown as Office), error }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateOffice(
  id: number,
  updates: Partial<Omit<Office, 'office_id' | 'created_at' | 'updated_at'>>,
): Promise<ServiceResponse<Office>> {
  const { data, error } = await supabase
    .from('l_offices')
    .update(updates)
    .eq('office_id', id)
    .select()
    .single()

  return { data: data ? mapOffice(data) : (null as unknown as Office), error }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteOffice(id: number): Promise<ServiceResponse<null>> {
  const { error } = await supabase.from('l_offices').delete().eq('office_id', id)
  return { data: null, error }
}

// ─── List (Paginated + Search + Filter) ──────────────────────────────────────

export async function listOffices({
  page = 1,
  pageSize = 10,
  search = '',
  status = null,
}: ListOfficesParams = {}): Promise<PaginatedResponse<Office>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('l_offices')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search.trim()) {
    query = query.or(
      `office_code.ilike.%${search.trim()}%,office_name.ilike.%${search.trim()}%,abbreviation.ilike.%${search.trim()}%`,
    )
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query

  if (error) return { data: [], count: 0, error }

  const rows: Office[] = (data ?? []).map(mapOffice)

  return { data: rows, count: count ?? 0, error: null }
}
