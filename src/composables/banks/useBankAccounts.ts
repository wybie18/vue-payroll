import { ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import {
  listBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getAllBankAccountWithBank,
  importBankAccounts,
} from '@/services/bank.service'
import type { AccountWithBank, BankAccount } from '@/types/bank.types'
import { toast } from 'vue-sonner'

// ─── Module-scoped shared state for lookups ───────────────────────────────────
const allAccountsWithBank = ref<AccountWithBank[]>([])
let allAccountsFetched = false
let fetchAllAccountsPromise: Promise<void> | null = null

export function clearBankAccountsCache() {
  allAccountsWithBank.value = []
  allAccountsFetched = false
  fetchAllAccountsPromise = null
}

export interface UseBankAccountsOptions {
  autoFetch?: boolean
}

export function useBankAccounts(options: UseBankAccountsOptions = {}) {
  const { autoFetch = false } = options

  const bankAccounts = ref<AccountWithBank[]>([])
  const totalCount = ref(0)
  const isLoading = ref(false)
  const search = ref('')
  const bankId = ref<number | null>(null)
  const page = ref(1)
  const pageSize = ref(10)

  async function fetchBankAccounts() {
    isLoading.value = true

    const { data, count, error } = await listBankAccounts({
      page: page.value,
      pageSize: pageSize.value,
      search: search.value,
      bankId: bankId.value,
    })

    if (error) {
      console.error('[useBankAccounts] fetch:', error.message)
      toast.error('Failed to load bank accounts', {
        description: 'Please check your connection and refresh the page.',
      })
    } else {
      bankAccounts.value = data
      totalCount.value = count
    }

    isLoading.value = false
  }

  async function fetchAllAccountsWithBank(force = false) {
    if (allAccountsFetched && !force) {
      return
    }

    if (fetchAllAccountsPromise) {
      return fetchAllAccountsPromise
    }

    fetchAllAccountsPromise = (async () => {
      const { data, error } = await getAllBankAccountWithBank()
      if (error) {
        console.error('[useBankAccounts] fetchAllAccountsWithBank:', error.message)
        toast.error('Failed to load all bank accounts')
      } else {
        allAccountsWithBank.value = data
        allAccountsFetched = true
      }
      fetchAllAccountsPromise = null
    })()

    return fetchAllAccountsPromise
  }

  // Re-fetch when page or pageSize changes
  watch([page, pageSize], fetchBankAccounts)

  // Watch bankId filter, reset page to 1
  watch(bankId, () => {
    if (page.value === 1) {
      fetchBankAccounts()
    } else {
      page.value = 1
    }
  })

  // Debounced search watcher
  watchDebounced(
    search,
    () => {
      if (page.value === 1) {
        fetchBankAccounts()
      } else {
        page.value = 1
      }
    },
    { debounce: 300 },
  )

  // Initial load only if autoFetch is explicitly requested
  if (autoFetch) {
    fetchBankAccounts()
  }

  async function addBankAccount(
    bank_id: number,
    account_number: string,
    fund_source: BankAccount['fund_source'],
  ) {
    const { error } = await createBankAccount({
      bank_id,
      account_number,
      fund_source,
    })

    if (error) {
      console.error('[useBankAccounts] create:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to create bank account.',
      })
    } else {
      await Promise.all([fetchBankAccounts(), fetchAllAccountsWithBank(true)])
      toast.success('Bank account successfully created!')
    }
  }

  async function editBankAccount(
    bank_account_id: number,
    bank_id: number,
    account_number: string,
    fund_source: BankAccount['fund_source'],
  ) {
    const { error } = await updateBankAccount(bank_account_id, {
      bank_id,
      account_number,
      fund_source,
    })
    if (error) {
      console.error('[useBankAccounts] update:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to update bank account.',
      })
    } else {
      await Promise.all([fetchBankAccounts(), fetchAllAccountsWithBank(true)])
      toast.success('Bank account successfully updated!')
    }
  }

  async function removeBankAccount(bank_account_id: number) {
    const { error } = await deleteBankAccount(bank_account_id)
    if (error) {
      console.error('[useBankAccounts] delete:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to delete bank account.',
      })
    } else {
      await Promise.all([fetchBankAccounts(), fetchAllAccountsWithBank(true)])
      toast.success('Bank account successfully deleted!')
    }
  }

  async function bulkImportBankAccounts(
    payload: { bank_id: number; account_number: string; fund_source: BankAccount['fund_source'] }[],
  ) {
    isLoading.value = true
    const { error } = await importBankAccounts(payload)
    isLoading.value = false

    if (error) {
      console.error('[useBankAccounts] import:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to import bank accounts.',
      })
      return false
    } else {
      await Promise.all([fetchBankAccounts(), fetchAllAccountsWithBank(true)])
      toast.success('Bank accounts successfully imported!')
      return true
    }
  }

  return {
    bankAccounts,
    totalCount,
    isLoading,
    search,
    bankId,
    page,
    pageSize,
    allAccountsWithBank,
    addBankAccount,
    editBankAccount,
    removeBankAccount,
    bulkImportBankAccounts,
    fetchBankAccounts,
    fetchAllAccountsWithBank,
    clearBankAccountsCache,
  }
}
