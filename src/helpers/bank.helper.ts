import type { AccountWithBank, Bank, BankAccount } from '@/types/bank.types'

// ─── Bank Mapper ──────────────────────────────────────────────────────────────

export function mapBank(item: any): Bank {
  return {
    bank_id: item.bank_id,
    bank_name: item.bank_name,
    bank_abbreviation: item.bank_abbreviation ?? null,
    branch_name: item.branch_name ?? null,
    address: item.address ?? null,
  }
}

// ─── Bank Account Mapper ──────────────────────────────────────────────────────

export function mapBankAccount(item: any): BankAccount {
  return {
    bank_account_id: item.bank_account_id,
    bank_id: item.bank_id,
    account_number: item.account_number,
    fund_source: item.fund_source,
  }
}

export function mapAccountWithBank(item: any): AccountWithBank {
  return {
    bank_account_id: item.bank_account_id,
    bank_id: item.bank_id,
    account_number: item.account_number,
    fund_source: item.fund_source,
    bank_name: item.bank?.bank_name ?? '',
    branch_name: item.bank?.branch_name ?? null,
    bank_abbreviation: item.bank?.bank_abbreviation ?? null,
  }
}
