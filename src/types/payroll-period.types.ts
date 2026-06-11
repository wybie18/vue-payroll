export interface PayrollPeriod {
  payroll_period_id: number
  cutoff_start: string
  cutoff_end: string
  created_at: string | null
  updated_at: string | null
}

export interface ListPayrollPeriodsParams {
  page?: number
  pageSize?: number
  startDate?: string | null
  endDate?: string | null
}
