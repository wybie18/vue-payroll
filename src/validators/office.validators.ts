export interface OfficeFormErrors {
  officeCode: string
  officeName: string
  abbreviation: string
  status: string
}

export function validateOfficeForm(
  officeCode: string,
  officeName: string,
  abbreviation: string,
  status: string,
): { valid: boolean; errors: OfficeFormErrors } {
  const errors: OfficeFormErrors = { officeCode: '', officeName: '', abbreviation: '', status: '' }
  let valid = true

  if (!officeCode.trim()) {
    errors.officeCode = 'Office code is required.'
    valid = false
  }

  if (!officeName.trim()) {
    errors.officeName = 'Office name is required.'
    valid = false
  }

  if (!abbreviation.trim()) {
    errors.abbreviation = 'Abbreviation is required.'
    valid = false
  }

  if (!status.trim()) {
    errors.status = 'Status is required.'
    valid = false
  }

  return { valid, errors }
}
