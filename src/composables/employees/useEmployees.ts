import { ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllEmployees,
  importEmployees,
} from '@/services/employee.service'
import type { Employee } from '@/types/employee.types'
import { toast } from 'vue-sonner'

export function useEmployees() {
  const employees = ref<Employee[]>([])
  const totalCount = ref(0)
  const isLoading = ref(false)
  const search = ref('')
  const officeId = ref<number | null>(null)
  const status = ref<string | null>(null)
  const batchId = ref<number | null>(null)
  const page = ref(1)
  const pageSize = ref(10)
  const allEmployees = ref<Employee[]>([])

  async function fetchEmployees() {
    isLoading.value = true

    const { data, count, error } = await listEmployees({
      page: page.value,
      pageSize: pageSize.value,
      search: search.value,
      officeId: officeId.value,
      status: status.value,
    })

    if (error) {
      console.error('[useEmployees] fetch:', error.message)
      toast.error('Failed to load employees', {
        description: 'Please check your connection and refresh the page.',
      })
    } else {
      employees.value = data
      totalCount.value = count
    }

    isLoading.value = false
  }

  async function fetchAllEmployees() {
    const { data, error } = await getAllEmployees()
    if (error) {
      console.error('[useEmployees] fetchAll:', error.message)
      toast.error('Failed to load all employees')
    } else {
      allEmployees.value = data
    }
  }

  watchDebounced(
    search,
    () => {
      page.value = 1
      fetchEmployees()
    },
    { debounce: 300 },
  )

  watch([page, pageSize, officeId, status, batchId], fetchEmployees)

  Promise.all([fetchEmployees()])

  async function addEmployee(
    name: string,
    office_id: number,
    bank_account_id: number,
    account_no: string,
    status: string,
    employee_no: string,
    eenggas_no: string,
    employment_status: string,
  ) {
    const { error } = await createEmployee({
      name,
      office_id,
      bank_account_id,
      account_no,
      status,
      employee_no,
      eenggas_no,
      employment_status,
    })

    if (error) {
      console.error('[useEmployees] create:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to create employee.',
      })
    } else {
      await fetchEmployees()
      toast.success('Employee successfully created!')
    }
  }

  async function editEmployee(
    id: number,
    name: string,
    office_id: number,
    bank_account_id: number,
    account_no: string,
    status: string,
    employee_no: string,
    eenggas_no: string,
    employment_status: string,
  ) {
    const { error } = await updateEmployee(id, {
      name,
      office_id,
      bank_account_id,
      account_no,
      status,
      employee_no,
      eenggas_no,
      employment_status,
    })
    if (error) {
      console.error('[useEmployees] update:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to update employee.',
      })
    } else {
      await fetchEmployees()
      toast.success('Employee successfully updated!')
    }
  }

  async function removeEmployee(id: number) {
    const { error } = await deleteEmployee(id)
    if (error) {
      console.error('[useEmployees] delete:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to delete employee.',
      })
    } else {
      await fetchEmployees()
      toast.success('Employee successfully deleted!')
    }
  }

  async function bulkImportEmployees(
    payload: Omit<Employee, 'id' | 'created_at' | 'updated_at'>[],
  ) {
    isLoading.value = true
    const { error } = await importEmployees(payload)
    isLoading.value = false

    if (error) {
      console.error('[useEmployees] import:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to import employees.',
      })
      return false
    } else {
      await fetchEmployees()
      toast.success('Employees successfully imported!')
      return true
    }
  }

  return {
    employees,
    totalCount,
    isLoading,
    search,
    officeId,
    status,
    batchId,
    page,
    pageSize,
    allEmployees,
    addEmployee,
    editEmployee,
    removeEmployee,
    bulkImportEmployees,
    fetchEmployees,
    fetchAllEmployees,
  }
}
