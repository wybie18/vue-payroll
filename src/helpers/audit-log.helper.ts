import type { AuditLog, AuditLogWithProfile } from '@/types/audit-log.types'

export function mapAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    table_name: row.table_name,
    action: row.action,
    old_data: row.old_data ?? null,
    new_data: row.new_data ?? null,
    changed_at: row.changed_at ?? null,
    changed_by: row.changed_by ?? null,
  }
}

export function mapAuditLogWithProfile(row: any): AuditLogWithProfile {
  return {
    ...mapAuditLog(row),
    profile: row.profile
      ? {
          email: row.profile.email,
          first_name: row.profile.first_name ?? null,
          last_name: row.profile.last_name ?? null,
          middle_name: row.profile.middle_name ?? null,
        }
      : null,
  }
}
