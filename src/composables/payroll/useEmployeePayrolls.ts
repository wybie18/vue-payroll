import { ref, type Ref, watch } from 'vue'
import {
  listEmployeePayrolls,
  createEmployeePayroll,
  updateEmployeePayroll,
  deleteEmployeePayroll,
  importEmployeePayroll,
} from '@/services/employee-payroll.service'
import type { EmployeePayrollWithEmployee } from '@/types/employee-payroll.types'
import { toast } from 'vue-sonner'

export function useEmployeePayrolls(batchId: Ref<number | null>) {
  const employeePayrolls = ref<EmployeePayrollWithEmployee[]>([])
  const totalCount = ref(0)
  const isLoading = ref(false)

  const page = ref(1)
  const pageSize = ref(10)

  async function fetchEmployeePayrolls() {
    if (!batchId.value) return

    isLoading.value = true

    const { data, count, error } = await listEmployeePayrolls({
      page: page.value,
      pageSize: pageSize.value,
      batch_id: batchId.value,
    })

    if (error) {
      console.error('[useEmployeePayrolls] fetch:', error.message)
      toast.error('Failed to load employee payrolls', {
        description: 'Please check your connection and refresh the page.',
      })
    } else {
      employeePayrolls.value = data
      totalCount.value = count
    }

    isLoading.value = false
  }

  watch([page, pageSize, batchId], fetchEmployeePayrolls, { immediate: true })

  async function addEmployeePayroll(
    employee_id: number,
    account_no: string,
    net_pay: number,
    bank_account_id: number | null,
  ) {
    if (!batchId.value) return

    const { error } = await createEmployeePayroll(batchId.value, {
      employee_id,
      account_no,
      net_pay,
      bank_account_id,
    })

    if (error) {
      console.error('[useEmployeePayrolls] create:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to create employee payroll.',
      })
    } else {
      await fetchEmployeePayrolls()
      toast.success('Employee payroll successfully created!')
    }
  }

  async function editEmployeePayroll(
    id: number,
    employee_id: number,
    account_no: string,
    net_pay: number,
    bank_account_id: number | null,
  ) {
    if (!batchId.value) return

    const { error } = await updateEmployeePayroll(batchId.value, id, {
      employee_id,
      account_no,
      net_pay,
      bank_account_id,
    })

    if (error) {
      console.error('[useEmployeePayrolls] update:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to update employee payroll.',
      })
    } else {
      await fetchEmployeePayrolls()
      toast.success('Employee payroll successfully updated!')
    }
  }

  async function removeEmployeePayroll(id: number) {
    const { error } = await deleteEmployeePayroll(id)
    if (error) {
      console.error('[useEmployeePayrolls] delete:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to delete employee payroll.',
      })
    } else {
      await fetchEmployeePayrolls()
      toast.success('Employee payroll successfully deleted!')
    }
  }

  async function bulkImportEmployeePayrolls(
    payload: {
      employee_id: number
      account_no: string
      net_pay: number
      bank_account_id: number | null
    }[],
  ) {
    if (!batchId.value) return false

    isLoading.value = true
    const { error } = await importEmployeePayroll(batchId.value, payload)
    isLoading.value = false

    if (error) {
      console.error('[useEmployeePayrolls] import:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to import employee payrolls.',
      })
      return false
    } else {
      await fetchEmployeePayrolls()
      toast.success('Employee payrolls successfully imported!')
      return true
    }
  }

  return {
    employeePayrolls,
    totalCount,
    isLoading,
    page,
    pageSize,
    addEmployeePayroll,
    editEmployeePayroll,
    removeEmployeePayroll,
    bulkImportEmployeePayrolls,
    fetchEmployeePayrolls,
  }
}
