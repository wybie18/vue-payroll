import { supabase } from '@/lib/supabase'
import type { ServiceResponse, PaginatedResponse } from '@/types/response.types'
import type {
  Bank,
  BankAccount,
  ListBanksParams,
  ListBankAccountsParams,
  AccountWithBank,
} from '@/types/bank.types'
import { mapAccountWithBank, mapBank, mapBankAccount } from '@/helpers/bank.helper'

// ─── Bank CRUD ────────────────────────────────────────────────────────────────

export async function getBankById(id: number): Promise<ServiceResponse<Bank | null>> {
  const { data, error } = await supabase.from('l_banks').select('*').eq('bank_id', id).maybeSingle()

  return { data: data ? mapBank(data) : null, error }
}

export async function createBank(payload: Omit<Bank, 'bank_id'>): Promise<ServiceResponse<Bank>> {
  const { data, error } = await supabase.from('l_banks').insert(payload).select().single()

  return { data: data ? mapBank(data) : (null as unknown as Bank), error }
}

export async function importBanks(
  payload: Omit<Bank, 'bank_id'>[],
): Promise<ServiceResponse<Bank[]>> {
  const { data, error } = await supabase.from('l_banks').insert(payload).select()

  return { data: (data ?? []).map(mapBank), error }
}

export async function updateBank(
  id: number,
  updates: Partial<Omit<Bank, 'bank_id'>>,
): Promise<ServiceResponse<Bank>> {
  const { data, error } = await supabase
    .from('l_banks')
    .update(updates)
    .eq('bank_id', id)
    .select()
    .single()

  return { data: data ? mapBank(data) : (null as unknown as Bank), error }
}

export async function deleteBank(id: number): Promise<ServiceResponse<null>> {
  const { error } = await supabase.from('l_banks').delete().eq('bank_id', id)
  return { data: null, error }
}

// ─── List Banks ───────────────────────────────────────────────────────────────

export async function listBanks({
  page = 1,
  pageSize = 10,
  search = '',
}: ListBanksParams = {}): Promise<PaginatedResponse<Bank>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from('l_banks').select('*', { count: 'exact' }).range(from, to)

  if (search.trim()) {
    query = query.or(
      `bank_name.ilike.%${search.trim()}%,branch_name.ilike.%${search.trim()}%,address.ilike.%${search.trim()}%,bank_abbreviation.ilike.%${search.trim()}%`,
    )
  }

  const { data, count, error } = await query

  if (error) return { data: [], count: 0, error }

  const rows: Bank[] = (data ?? []).map(mapBank)

  return { data: rows, count: count ?? 0, error: null }
}

// ─── Bank Account CRUD ────────────────────────────────────────────────────────

export async function getBankAccountById(id: number): Promise<ServiceResponse<BankAccount | null>> {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('bank_account_id', id)
    .maybeSingle()

  return { data: data ? mapBankAccount(data) : null, error }
}

export async function getAllBankAccountWithBank(): Promise<ServiceResponse<AccountWithBank[]>> {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*, bank:l_banks(bank_name, branch_name, bank_abbreviation)')

  if (error) return { data: [], error }

  const accounts: AccountWithBank[] = (data ?? []).map(mapAccountWithBank)

  return { data: accounts, error }
}

export async function createBankAccount(
  payload: Omit<BankAccount, 'bank_account_id'>,
): Promise<ServiceResponse<BankAccount>> {
  const { data, error } = await supabase.from('bank_accounts').insert(payload).select().single()

  return { data: data ? mapBankAccount(data) : (null as unknown as BankAccount), error }
}

export async function importBankAccounts(
  payload: Omit<BankAccount, 'bank_account_id'>[],
): Promise<ServiceResponse<BankAccount[]>> {
  const { data, error } = await supabase.from('bank_accounts').insert(payload).select()

  return { data: (data ?? []).map(mapBankAccount), error }
}

export async function updateBankAccount(
  id: number,
  updates: Partial<Omit<BankAccount, 'bank_account_id'>>,
): Promise<ServiceResponse<BankAccount>> {
  const { data, error } = await supabase
    .from('bank_accounts')
    .update(updates)
    .eq('bank_account_id', id)
    .select()
    .single()

  return { data: data ? mapBankAccount(data) : (null as unknown as BankAccount), error }
}

export async function deleteBankAccount(id: number): Promise<ServiceResponse<null>> {
  const { error } = await supabase.from('bank_accounts').delete().eq('bank_account_id', id)
  return { data: null, error }
}

// ─── List Bank Accounts ───────────────────────────────────────────────────────

export async function listBankAccounts({
  page = 1,
  pageSize = 10,
  search = '',
  bankId = null,
}: ListBankAccountsParams = {}): Promise<PaginatedResponse<AccountWithBank>> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('bank_accounts')
    .select('*, bank:l_banks(bank_name, branch_name)', { count: 'exact' })
    .range(from, to)

  if (search.trim()) {
    query = query.ilike('account_number', `%${search.trim()}%`)
  }

  if (bankId) {
    query = query.eq('bank_id', bankId)
  }

  const { data, count, error } = await query

  if (error) return { data: [], count: 0, error }

  const rows: AccountWithBank[] = (data ?? []).map(mapAccountWithBank)

  return { data: rows, count: count ?? 0, error: null }
}
