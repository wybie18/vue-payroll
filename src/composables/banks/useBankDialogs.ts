import { ref } from 'vue'
import type { Bank } from '@/types/bank.types'

export function useBankDialogs() {
  const formOpen = ref(false)
  const selectedBank = ref<Bank | null>(null)

  function openCreate() {
    selectedBank.value = null
    formOpen.value = true
  }

  function openEdit(bank: Bank) {
    selectedBank.value = bank
    formOpen.value = true
  }

  const deleteOpen = ref(false)
  const bankToDelete = ref<Bank | null>(null)

  function openDelete(bank: Bank) {
    bankToDelete.value = bank
    deleteOpen.value = true
  }

  return {
    formOpen,
    selectedBank,
    openCreate,
    openEdit,
    deleteOpen,
    bankToDelete,
    openDelete,
  }
}
