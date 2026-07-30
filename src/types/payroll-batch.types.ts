import type { CompensationType } from './payroll-period.types'

export interface PayrollBatch {
  batch_id: number
  payroll_period_id: number
  office_id: number | null
  bank_account_id: number | null
  batch_code: string
  status: string
  created_at: string | null
  updated_at: string | null
}

export interface PayrollBatchWithRelations extends PayrollBatch {
  description: string | null
  compensation_type: CompensationType | null
  total_employees: number
  total_net_pay: number
  bank_abbreviation: string | null
  bank_account_number: string | null
  fund_source: 'EE' | 'GF' | 'SH' | null
  period: {
    cutoff_start: string
    cutoff_end: string
  }
}

export interface ListPayrollBatchesParams {
  page?: number
  pageSize?: number
  payroll_period_id?: number | null
  office_id?: number | null
  bank_account_id?: number | null
  status?: string | null
  search?: string
}
