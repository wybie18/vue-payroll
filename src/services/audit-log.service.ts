import { supabase } from '@/lib/supabase'
import type { PaginatedResponse } from '@/types/response.types'
import type { AuditLogWithProfile, ListAuditLogsParams } from '@/types/audit-log.types'
import { mapAuditLogWithProfile } from '@/helpers/audit-log.helper'

// ─── List (Paginated + Filter) ────────────────────────────────────────────────

export async function listAuditLogs({
  page = 1,
  pageSize = 10,
  tableName = null,
  action = null,
  startDate = null,
  endDate = null,
}: ListAuditLogsParams = {}): Promise<PaginatedResponse<AuditLogWithProfile>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('audit_logs')
    .select(
      `
      *,
      profile:profiles(email, first_name, last_name, middle_name)
    `,
      { count: 'exact' },
    )
    .order('changed_at', { ascending: false })
    .range(from, to)

  if (tableName?.trim()) {
    query = query.ilike('table_name', `%${tableName.trim()}%`)
  }
  if (action?.trim()) {
    query = query.eq('action', action.trim().toUpperCase())
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
