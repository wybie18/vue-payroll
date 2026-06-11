import type { PayrollBatch, PayrollBatchWithRelations } from '@/types/payroll-batch.types'

export function mapPayrollBatch(row: any): PayrollBatch {
  return {
    batch_id: row.batch_id,
    payroll_period_id: row.payroll_period_id,
    office_id: row.office_id ?? null,
    bank_account_id: row.bank_account_id ?? null,
    batch_code: row.batch_code,
    description: row.description ?? null,
    status: row.status,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  }
}

export function mapPayrollBatchesWithRelations(rows: any): PayrollBatchWithRelations {
  return {
    ...mapPayrollBatch(rows),
    period: {
      cutoff_start: rows.period?.cutoff_start ?? '',
      cutoff_end: rows.period?.cutoff_end ?? '',
    },
    total_employees: rows.total_employees ?? 0,
    total_net_pay: rows.total_net_pay ?? 0,
    bank_abbreviation: rows.bank_abbreviation ?? null,
    bank_account_number: rows.bank_account_number ?? null,
    fund_source: rows.fund_source ?? null,
  }
}
