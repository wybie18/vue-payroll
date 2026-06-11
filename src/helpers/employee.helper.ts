import type { Employee } from '@/types/employee.types'

// ─── Row Mapper ───────────────────────────────────────────────────────────────

export function mapEmployee(item: any): Employee {
  return {
    id: item.id,
    name: item.name,
    office_id: item.office_id,
    bank_account_id: item.bank_account_id,
    account_no: item.account_no,
    status: item.status ?? 'Active',
    employee_no: item.employee_no,
    eenggas_no: item.eenggas_no,
    employment_status: item.employment_status,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }
}
