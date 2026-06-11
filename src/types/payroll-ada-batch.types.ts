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
