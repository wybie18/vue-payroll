export interface PayrollBatchFormErrors {
  payroll_period_id: string
}

export function validatePayrollBatchForm(
  payroll_period_id: number | null,
): { valid: boolean; errors: PayrollBatchFormErrors } {
  const errors: PayrollBatchFormErrors = { payroll_period_id: '' }
  let valid = true

  if (!payroll_period_id) {
    errors.payroll_period_id = 'Payroll period is required.'
    valid = false
  }

  return { valid, errors }
}
