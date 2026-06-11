export interface Employee {
  id: number
  name: string
  office_id: number
  bank_account_id: number
  account_no: string
  status: string
  employee_no: string
  eenggas_no: string
  employment_status:
    | 'Permanent'
    | 'Temporary'
    | 'Coterminous'
    | 'Elected'
    | 'Casual'
    | 'Job Order'
    | 'Contract of Service'
    | 'Consultant'
    | 'Detailed'
    | 'Probationary'
    | 'Appointed'
  created_at: string
  updated_at: string
}

export interface ListEmployeesParams {
  page?: number
  pageSize?: number
  search?: string
  officeId?: number | null
  status?: string | null
}
