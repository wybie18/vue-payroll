import type { Office } from '@/types/office.types'

// ─── Row Mapper ───────────────────────────────────────────────────────────────

export function mapOffice(item: any): Office {
  return {
    office_id: item.office_id,
    office_code: item.office_code,
    office_name: item.office_name,
    abbreviation: item.abbreviation ?? null,
    status: item.status ?? 'Active',
    created_at: item.created_at,
    updated_at: item.updated_at,
  }
}
