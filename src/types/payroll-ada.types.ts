import type { PayrollPeriod, CompensationType } from './payroll-period.types'

export interface PayrollAda {
  ada_id: number
  payroll_period_id: number
  bank_account_id: number
  ada_number: string
  ada_date: string
  status: string
  created_at: string | null
  updated_at: string | null
}

export interface PayrollAdaWithDetails extends PayrollAda {
  compensation_type: CompensationType | null
  description: string | null
  total_batches: number
  total_net_pay: number
  period?: Pick<PayrollPeriod, 'cutoff_start' | 'cutoff_end'> | null
  bank_account?: {
    fund_source: string
    bank?: {
      bank_abbreviation: string
    } | null
  } | null
}

export interface ListPayrollAdasParams {
  page?: number
  pageSize?: number
  payroll_period_id?: number | null
  bank_account_id?: number | null
  status?: string | null
  search?: string
}
