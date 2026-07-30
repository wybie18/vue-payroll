export interface PayrollAdaFormErrors {
  payroll_period_id: string
  bank_account_id: string
  ada_date: string
  status: string
}

export function validatePayrollAdaForm(
  payroll_period_id: number | null,
  bank_account_id: number | null,
  ada_date: string,
  status: string,
): { valid: boolean; errors: PayrollAdaFormErrors } {
  const errors: PayrollAdaFormErrors = {
    payroll_period_id: '',
    bank_account_id: '',
    ada_date: '',
    status: '',
  }
  let valid = true

  if (!payroll_period_id) {
    errors.payroll_period_id = 'Payroll period is required.'
    valid = false
  }

  if (!bank_account_id) {
    errors.bank_account_id = 'Bank account is required.'
    valid = false
  }

  if (!ada_date.trim()) {
    errors.ada_date = 'ADA date is required.'
    valid = false
  }

  if (!status.trim()) {
    errors.status = 'Status is required.'
    valid = false
  }

  return { valid, errors }
}
