export interface BankFormErrors {
  bankName: string
  bankAbbreviation: string
  branchName: string
  address: string
}

export function validateBankForm(
  bankName: string,
  bankAbbreviation: string,
  branchName: string,
  address: string,
): { valid: boolean; errors: BankFormErrors } {
  const errors: BankFormErrors = { bankName: '', bankAbbreviation: '', branchName: '', address: '' }
  let valid = true

  if (!bankName.trim()) {
    errors.bankName = 'Bank name is required.'
    valid = false
  }

  return { valid, errors }
}

export interface BankAccountFormErrors {
  bankId: string
  accountNumber: string
  fundSource: string
}

export function validateBankAccountForm(
  bankId: number | null,
  accountNumber: string,
  fundSource: string,
): { valid: boolean; errors: BankAccountFormErrors } {
  const errors: BankAccountFormErrors = { bankId: '', accountNumber: '', fundSource: '' }
  let valid = true

  if (!bankId) {
    errors.bankId = 'Bank is required.'
    valid = false
  }

  if (!accountNumber.trim()) {
    errors.accountNumber = 'Account number is required.'
    valid = false
  }

  if (!fundSource.trim()) {
    errors.fundSource = 'Fund source is required.'
    valid = false
  }

  return { valid, errors }
}
