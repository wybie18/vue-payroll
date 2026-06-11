import { ref } from 'vue'
import type { PayrollAdaBatchWithRelations } from '@/types/payroll-ada-batch.types'

export function usePayrollAdaBatchDialogs() {
  const formOpen = ref(false)
  const deleteOpen = ref(false)
  const adaBatchToDelete = ref<PayrollAdaBatchWithRelations | null>(null)

  function openCreate() {
    formOpen.value = true
  }

  function openDelete(row: PayrollAdaBatchWithRelations) {
    adaBatchToDelete.value = row
    deleteOpen.value = true
  }

  return {
    formOpen,
    openCreate,
    deleteOpen,
    adaBatchToDelete,
    openDelete,
  }
}
