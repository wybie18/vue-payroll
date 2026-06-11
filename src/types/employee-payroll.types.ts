export interface EmployeePayroll {
  id: number
  batch_id: number
  bank_account_id: number | null
  employee_id: number
  account_no: string
  net_pay: number
  created_at: string | null
  updated_at: string | null
}

export interface EmployeePayrollWithEmployee extends EmployeePayroll {
  employee: {
    name: string
    account_no: string
    employee_no: string
    eenggas_no: string
  }
}

export interface ListEmployeePayrollsParams {
  page?: number
  pageSize?: number
  batch_id: number
}
