export type CompensationType =
  | 'allowance'
  | 'bonus'
  | 'overtime'
  | 'honorarium'
  | 'mixed'
  | 'refund'
  | 'wages'

export interface PayrollPeriod {
  payroll_period_id: number
  cutoff_start: string
  cutoff_end: string
  description: string | null
  compensation_type: CompensationType | null
  created_at: string | null
  updated_at: string | null
}

export interface ListPayrollPeriodsParams {
  page?: number
  pageSize?: number
  startDate?: string | null
  endDate?: string | null
  compensation_type?: CompensationType | null
  search?: string
}
