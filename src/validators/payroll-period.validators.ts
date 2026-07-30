export interface PayrollPeriodFormErrors {
  cutoff_start: string
  cutoff_end: string
  description: string
  compensation_type: string
}

export function validatePayrollPeriodForm(
  cutoff_start: string,
  cutoff_end: string,
  description?: string | null,
  compensation_type?: string | null,
): { valid: boolean; errors: PayrollPeriodFormErrors } {
  const errors: PayrollPeriodFormErrors = {
    cutoff_start: '',
    cutoff_end: '',
    description: '',
    compensation_type: '',
  }
  let valid = true

  if (!cutoff_start) {
    errors.cutoff_start = 'Start date is required.'
    valid = false
  }

  if (!cutoff_end) {
    errors.cutoff_end = 'End date is required.'
    valid = false
  }

  if (cutoff_start && cutoff_end && new Date(cutoff_start) > new Date(cutoff_end)) {
    errors.cutoff_end = 'End date cannot be before start date.'
    valid = false
  }

  if (!compensation_type?.trim()) {
    errors.compensation_type = 'Compensation type is required.'
    valid = false
  }

  return { valid, errors }
}
