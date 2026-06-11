export interface Bank {
  bank_id: number
  bank_name: string
  bank_abbreviation: string | null
  branch_name: string | null
  address: string | null
}

export interface BankAccount {
  bank_account_id: number
  bank_id: number
  account_number: string
  fund_source: 'EE' | 'GF' | 'SH' | 'TF' | 'PO'
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
