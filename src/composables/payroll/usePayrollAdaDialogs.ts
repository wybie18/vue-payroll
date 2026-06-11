import { ref } from 'vue'
import type { PayrollAdaWithDetails } from '@/types/payroll-ada.types'

export function usePayrollAdaDialogs() {
  const formOpen = ref(false)
  const selectedPayrollAda = ref<PayrollAdaWithDetails | null>(null)

  const deleteOpen = ref(false)
  const payrollAdaToDelete = ref<PayrollAdaWithDetails | null>(null)

  function openCreate() {
    selectedPayrollAda.value = null
    formOpen.value = true
  }

  function openEdit(row: PayrollAdaWithDetails) {
    selectedPayrollAda.value = { ...row }
    formOpen.value = true
  }

  function openDelete(row: PayrollAdaWithDetails) {
    payrollAdaToDelete.value = row
    deleteOpen.value = true
  }

  return {
    formOpen,
    selectedPayrollAda,
    openCreate,
    openEdit,
    deleteOpen,
    payrollAdaToDelete,
    openDelete,
  }
}
