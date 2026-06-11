export interface EmployeePayrollFormErrors {
  employee_id: string
  net_pay: string
}

export function validateEmployeePayrollForm(
  employee_id: number | null,
  net_pay: number | string | null,
): { valid: boolean; errors: EmployeePayrollFormErrors } {
  const errors: EmployeePayrollFormErrors = { employee_id: '', net_pay: '' }
  let valid = true

  if (!employee_id) {
    errors.employee_id = 'Employee is required.'
    valid = false
  }

  if (net_pay === null || net_pay === undefined || net_pay === '') {
    errors.net_pay = 'Net pay is required.'
    valid = false
  } else if (isNaN(Number(net_pay))) {
    errors.net_pay = 'Net pay must be a valid number.'
    valid = false
  } else if (Number(net_pay) < 0) {
    errors.net_pay = 'Net pay cannot be negative.'
    valid = false
  }

  return { valid, errors }
}
