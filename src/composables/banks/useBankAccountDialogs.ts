import { ref } from 'vue'
import type { BankAccount } from '@/types/bank.types'

export function useBankAccountDialogs() {
  const formOpen = ref(false)
  const selectedBankAccount = ref<BankAccount | null>(null)

  function openCreate() {
    selectedBankAccount.value = null
    formOpen.value = true
  }

  function openEdit(account: BankAccount) {
    selectedBankAccount.value = account
    formOpen.value = true
  }

  const deleteOpen = ref(false)
  const bankAccountToDelete = ref<BankAccount | null>(null)

  function openDelete(account: BankAccount) {
    bankAccountToDelete.value = account
    deleteOpen.value = true
  }

  return {
    formOpen,
    selectedBankAccount,
    openCreate,
    openEdit,
    deleteOpen,
    bankAccountToDelete,
    openDelete,
  }
}
