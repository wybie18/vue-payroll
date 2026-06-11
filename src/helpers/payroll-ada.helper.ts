import type { PayrollAda, PayrollAdaWithDetails } from '@/types/payroll-ada.types'

export function mapPayrollAda(row: any): PayrollAda {
  return {
    ada_id: row.ada_id,
    payroll_period_id: row.payroll_period_id,
    bank_account_id: row.bank_account_id,
    ada_number: row.ada_number,
    ada_date: row.ada_date,
    status: row.status,
    compensation_type: row.compensation_type,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  }
}

export function mapPayrollAdaWithDetails(row: any): PayrollAdaWithDetails {
  return {
    ...mapPayrollAda(row),
    total_batches: row.total_batches ?? 0,
    total_net_pay: row.total_net_pay ?? 0,
    period: row.period
      ? {
          cutoff_start: row.period.cutoff_start,
          cutoff_end: row.period.cutoff_end,
        }
      : null,
    bank_account: row.bank_account
      ? {
          fund_source: row.bank_account.fund_source,
          bank: row.bank_account.bank
            ? {
                bank_abbreviation: row.bank_account.bank.bank_abbreviation,
              }
            : null,
        }
      : null,
  }
}
