export interface EmployeeFormErrors {
  name: string
  office_id: string
  bank_account_id: string
  account_no: string
  employee_no: string
  eenggas_no: string
  status: string
  employment_status: string
}

export function validateEmployeeForm(
  name: string,
  officeId: number | null,
  bankAccountId: number | null,
  accountNo: string,
  employeeNo: string,
  eenggasNo: string,
  status: string,
  employmentStatus: string,
): { valid: boolean; errors: EmployeeFormErrors } {
  const errors: EmployeeFormErrors = {
    name: '',
    office_id: '',
    bank_account_id: '',
    account_no: '',
    employee_no: '',
    eenggas_no: '',
    status: '',
    employment_status: '',
  }
  let valid = true

  if (!name.trim()) {
    errors.name = 'Name is required.'
    valid = false
  }

  if (!officeId) {
    errors.office_id = 'Office is required.'
    valid = false
  }

  if (!bankAccountId) {
    errors.bank_account_id = 'Bank account is required.'
    valid = false
  }

  if (!accountNo.trim()) {
    errors.account_no = 'Account number is required.'
    valid = false
  }

  if (!employeeNo.trim()) {
    errors.employee_no = 'Employee number is required.'
    valid = false
  }

  if (!eenggasNo.trim()) {
    errors.eenggas_no = 'EENGGAS number is required.'
    valid = false
  }

  if (!status.trim()) {
    errors.status = 'Status is required.'
    valid = false
  }

  if (!employmentStatus.trim()) {
    errors.employment_status = 'Employment status is required.'
    valid = false
  }

  return { valid, errors }
}
