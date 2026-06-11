import type { EmployeePayrollWithEmployee } from '@/types/employee-payroll.types'

export function mapEmployeePayroll(row: any): EmployeePayrollWithEmployee {
  return {
    id: row.id,
    batch_id: row.batch_id,
    bank_account_id: row.bank_account_id ?? null,
    employee_id: row.employee_id,
    account_no: row.account_no,
    net_pay: Number(row.net_pay),
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
    employee: {
      name: row.employee?.name,
      account_no: row.employee?.account_no,
      employee_no: row.employee?.employee_no,
      eenggas_no: row.employee?.eenggas_no,
    },
  }
}
