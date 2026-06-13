export interface PayrollAdaBatch {
  id: number
  ada_id: number
  batch_id: number | null
  created_at: string | null
  updated_at: string | null
}

export interface PayrollAdaBatchWithRelations {
  id: number // maps to ada_batch_id
  ada_id: number
  batch_id: number
  batch_code: string
  description: string | null
  batch_status: string
  office_code: string | null
  office_name: string | null
  cutoff_start: string | null
  cutoff_end: string | null
  fund_source: string | null
  bank_abbreviation: string | null
  total_employees: number
  total_net_pay: number
  assigned_at: string | null
}

export interface AdaDetailsBankAccount {
  account_number: string
  bank_abbreviation: string | null
  fund_source: string
}

export interface AdaPeriod {
  payroll_period_id: number
  cutoff_start: string
  cutoff_end: string
}

export interface AdaDetailsEmployee {
  name: string
  account_no: string
  net_pay: number
}

export interface AdaDetailsBatch {
  batch_id: number
  batch_code: string
  total_net_pay: number
  employees: AdaDetailsEmployee[]
}

export interface AdaDetails {
  ada_number: string
  ada_date: string
  status: string
  period: AdaPeriod
  bank_account: AdaDetailsBankAccount
  employees: AdaDetailsEmployee[]
  batches: AdaDetailsBatch[]
  total_net_pay: number
}
