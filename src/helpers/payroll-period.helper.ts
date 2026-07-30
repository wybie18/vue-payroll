import type { PayrollPeriod } from '@/types/payroll-period.types'

export function mapPayrollPeriod(row: any): PayrollPeriod {
  return {
    payroll_period_id: row.payroll_period_id,
    cutoff_start: row.cutoff_start,
    cutoff_end: row.cutoff_end,
    description: row.description ?? null,
    compensation_type: row.compensation_type ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  }
}
