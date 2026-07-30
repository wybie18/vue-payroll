import { ref, watch } from 'vue'
import {
  listPayrollPeriods,
  createPayrollPeriod,
  updatePayrollPeriod,
  deletePayrollPeriod,
} from '@/services/payroll-period.service'
import type { PayrollPeriod, CompensationType } from '@/types/payroll-period.types'
import { toast } from 'vue-sonner'

export function usePayrollPeriods() {
  const payrollPeriods = ref<PayrollPeriod[]>([])
  const totalCount = ref(0)
  const isLoading = ref(false)
  
  const startDate = ref<string | null>(null)
  const endDate = ref<string | null>(null)
  const compensationTypeFilter = ref<CompensationType | null>(null)
  const searchQuery = ref<string>('')
  
  const page = ref(1)
  const pageSize = ref(10)

  async function fetchPayrollPeriods() {
    isLoading.value = true

    const { data, count, error } = await listPayrollPeriods({
      page: page.value,
      pageSize: pageSize.value,
      startDate: startDate.value,
      endDate: endDate.value,
      compensation_type: compensationTypeFilter.value,
      search: searchQuery.value,
    })

    if (error) {
      console.error('[usePayrollPeriods] fetch:', error.message)
      toast.error('Failed to load payroll periods', {
        description: 'Please check your connection and refresh the page.',
      })
    } else {
      payrollPeriods.value = data
      totalCount.value = count
    }

    isLoading.value = false
  }

  // Watch pagination parameters
  watch([page, pageSize], fetchPayrollPeriods)

  // When filters change, reset to page 1 (if not already 1)
  watch([startDate, endDate, compensationTypeFilter, searchQuery], () => {
    if (page.value === 1) {
      fetchPayrollPeriods()
    } else {
      page.value = 1
    }
  })

  // Initial fetch
  fetchPayrollPeriods()

  async function addPayrollPeriod(
    cutoff_start: string,
    cutoff_end: string,
    description?: string | null,
    compensation_type?: CompensationType | null,
  ) {
    const { error } = await createPayrollPeriod({
      cutoff_start,
      cutoff_end,
      description: description ?? null,
      compensation_type: compensation_type ?? null,
    })

    if (error) {
      console.error('[usePayrollPeriods] create:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to create payroll period.',
      })
    } else {
      await fetchPayrollPeriods()
      toast.success('Payroll period successfully created!')
    }
  }

  async function editPayrollPeriod(
    id: number,
    cutoff_start: string,
    cutoff_end: string,
    description?: string | null,
    compensation_type?: CompensationType | null,
  ) {
    const { error } = await updatePayrollPeriod(id, {
      cutoff_start,
      cutoff_end,
      description: description ?? null,
      compensation_type: compensation_type ?? null,
    })
    if (error) {
      console.error('[usePayrollPeriods] update:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to update payroll period.',
      })
    } else {
      await fetchPayrollPeriods()
      toast.success('Payroll period successfully updated!')
    }
  }

  async function removePayrollPeriod(id: number) {
    const { error } = await deletePayrollPeriod(id)
    if (error) {
      console.error('[usePayrollPeriods] delete:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to delete payroll period.',
      })
    } else {
      await fetchPayrollPeriods()
      toast.success('Payroll period successfully deleted!')
    }
  }

  return {
    payrollPeriods,
    totalCount,
    isLoading,
    startDate,
    endDate,
    compensationTypeFilter,
    searchQuery,
    page,
    pageSize,
    addPayrollPeriod,
    editPayrollPeriod,
    removePayrollPeriod,
    fetchPayrollPeriods,
  }
}
