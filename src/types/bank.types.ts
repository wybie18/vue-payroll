export interface Bank {
  bank_id: number
  bank_name: string
  bank_abbreviation: string | null
  branch_name: string | null
  address: string | null
}

export const FUND_SOURCES = [
  { value: 'EE', label: 'Economic Enterprise' },
  { value: 'GF', label: 'General Fund' },
  { value: 'SH', label: 'Slaughter House' },
  { value: 'TF', label: 'Trust Fund Proper' },
  { value: 'PO', label: 'Peace and Order' },
] as const

export type FundSourceValue = (typeof FUND_SOURCES)[number]['value']

export interface BankAccount {
  bank_account_id: number
  bank_id: number
  account_number: string
  fund_source: FundSourceValue
}

export interface BankWithAccounts extends Bank {
  accounts: BankAccount[]
}

export interface AccountWithBank extends BankAccount {
  bank_name: string
  branch_name: string | null
  bank_abbreviation: string | null
}

export interface ListBanksParams {
  page?: number
  pageSize?: number
  search?: string
}

export interface ListBankAccountsParams {
  page?: number
  pageSize?: number
  search?: string
  bankId?: number | null
}
