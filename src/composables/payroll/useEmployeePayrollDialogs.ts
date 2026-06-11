import { ref } from 'vue'
import type { EmployeePayrollWithEmployee } from '@/types/employee-payroll.types'

export function useEmployeePayrollDialogs() {
  const formOpen = ref(false)
  const selectedEmployeePayroll = ref<EmployeePayrollWithEmployee | null>(null)

  const deleteOpen = ref(false)
  const employeePayrollToDelete = ref<EmployeePayrollWithEmployee | null>(null)

  function openCreate() {
    selectedEmployeePayroll.value = null
    formOpen.value = true
  }

  function openEdit(row: EmployeePayrollWithEmployee) {
    selectedEmployeePayroll.value = { ...row }
    formOpen.value = true
  }

  function openDelete(row: EmployeePayrollWithEmployee) {
    employeePayrollToDelete.value = row
    deleteOpen.value = true
  }

  return {
    formOpen,
    selectedEmployeePayroll,
    openCreate,
    openEdit,
    deleteOpen,
    employeePayrollToDelete,
    openDelete,
  }
}
