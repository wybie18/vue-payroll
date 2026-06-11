import { ref } from 'vue'
import type { Employee } from '@/types/employee.types'

export function useEmployeeDialogs() {
  const formOpen = ref(false)
  const selectedEmployee = ref<Employee | null>(null)

  function openCreate() {
    selectedEmployee.value = null
    formOpen.value = true
  }

  function openEdit(employee: Employee) {
    selectedEmployee.value = employee
    formOpen.value = true
  }

  const deleteOpen = ref(false)
  const employeeToDelete = ref<Employee | null>(null)

  function openDelete(employee: Employee) {
    employeeToDelete.value = employee
    deleteOpen.value = true
  }

  return {
    formOpen,
    selectedEmployee,
    openCreate,
    openEdit,
    deleteOpen,
    employeeToDelete,
    openDelete,
  }
}
