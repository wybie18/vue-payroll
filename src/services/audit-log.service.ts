import { supabase } from '@/lib/supabase'
import type { ServiceResponse, PaginatedResponse } from '@/types/response.types'
import type { AuditLog, AuditLogWithProfile, ListAuditLogsParams } from '@/types/audit-log.types'
import { mapAuditLog, mapAuditLogWithProfile } from '@/helpers/audit-log.helper'

// ─── Get By ID ────────────────────────────────────────────────────────────────

export async function getAuditLogById(id: string): Promise<ServiceResponse<AuditLogWithProfile | null>> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      profile:profiles(email, first_name, last_name, middle_name)
    `)
    .eq('id', id)
    .maybeSingle()

  return { data: data ? mapAuditLogWithProfile(data) : null, error }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createAuditLog(
  payload: Omit<AuditLog, 'id' | 'changed_at'>,
): Promise<ServiceResponse<AuditLog>> {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert(payload)
    .select()
    .single()

  return { data: data ? mapAuditLog(data) : (null as unknown as AuditLog), error }
}

// ─── List (Paginated + Filter) ────────────────────────────────────────────────

export async function listAuditLogs({
  page = 1,
  pageSize = 10,
  tableName = null,
  action = null,
  changedBy = null,
  startDate = null,
  endDate = null,
}: ListAuditLogsParams = {}): Promise<PaginatedResponse<AuditLogWithProfile>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      profile:profiles(email, first_name, last_name, middle_name)
    `, { count: 'exact' })
    .order('changed_at', { ascending: false })
    .range(from, to)

  if (tableName) {
    query = query.eq('table_name', tableName)
  }
  if (action) {
    query = query.eq('action', action)
  }
  if (changedBy) {
    query = query.eq('changed_by', changedBy)
  }
  if (startDate) {
    query = query.gte('changed_at', startDate)
  }
  if (endDate) {
    query = query.lte('changed_at', endDate)
  }

  const { data, count, error } = await query

  if (error) return { data: [], count: 0, error }

  const rows: AuditLogWithProfile[] = (data ?? []).map(mapAuditLogWithProfile)

  return { data: rows, count: count ?? 0, error: null }
}
