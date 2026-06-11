import { ref } from 'vue'
import type { PayrollBatchWithRelations } from '@/types/payroll-batch.types'

export function usePayrollBatchDialogs() {
  const formOpen = ref(false)
  const selectedPayrollBatch = ref<PayrollBatchWithRelations | null>(null)

  const deleteOpen = ref(false)
  const payrollBatchToDelete = ref<PayrollBatchWithRelations | null>(null)

  function openCreate() {
    selectedPayrollBatch.value = null
    formOpen.value = true
  }

  function openEdit(row: PayrollBatchWithRelations) {
    selectedPayrollBatch.value = { ...row }
    formOpen.value = true
  }

  function openDelete(row: PayrollBatchWithRelations) {
    payrollBatchToDelete.value = row
    deleteOpen.value = true
  }

  return {
    formOpen,
    selectedPayrollBatch,
    openCreate,
    openEdit,
    deleteOpen,
    payrollBatchToDelete,
    openDelete,
  }
}
