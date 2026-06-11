import { ref } from 'vue'
import type { PayrollPeriod } from '@/types/payroll-period.types'

export function usePayrollPeriodDialogs() {
  const formOpen = ref(false)
  const selectedPayrollPeriod = ref<PayrollPeriod | null>(null)

  const deleteOpen = ref(false)
  const payrollPeriodToDelete = ref<PayrollPeriod | null>(null)

  function openCreate() {
    selectedPayrollPeriod.value = null
    formOpen.value = true
  }

  function openEdit(row: PayrollPeriod) {
    selectedPayrollPeriod.value = { ...row }
    formOpen.value = true
  }

  function openDelete(row: PayrollPeriod) {
    payrollPeriodToDelete.value = row
    deleteOpen.value = true
  }

  return {
    formOpen,
    selectedPayrollPeriod,
    openCreate,
    openEdit,
    deleteOpen,
    payrollPeriodToDelete,
    openDelete,
  }
}
