export interface AuditLog {
  id: string
  table_name: string
  action: string
  old_data: any | null
  new_data: any | null
  changed_at: string | null
  changed_by: string | null
}

export interface AuditLogWithProfile extends AuditLog {
  profile: {
    email: string
    first_name: string | null
    last_name: string | null
    middle_name: string | null
  } | null
}

export interface ListAuditLogsParams {
  page?: number
  pageSize?: number
  tableName?: string | null
  action?: string | null
  startDate?: string | null
  endDate?: string | null
}
