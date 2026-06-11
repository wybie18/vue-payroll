import { ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import {
  listPayrollBatches,
  createPayrollBatch,
  updatePayrollBatch,
  deletePayrollBatch,
} from '@/services/payroll-batch.service'
import type { PayrollBatchWithRelations } from '@/types/payroll-batch.types'
import { toast } from 'vue-sonner'

export function usePayrollBatches() {
  const payrollBatches = ref<PayrollBatchWithRelations[]>([])
  const totalCount = ref(0)
  const isLoading = ref(false)

  const payroll_period_id = ref<number | null>(null)
  const office_id = ref<number | null>(null)
  const bank_account_id = ref<number | null>(null)
  const status = ref<string | null>(null)
  const search = ref('')

  const page = ref(1)
  const pageSize = ref(10)

  async function fetchPayrollBatches() {
    isLoading.value = true

    const { data, count, error } = await listPayrollBatches({
      page: page.value,
      pageSize: pageSize.value,
      payroll_period_id: payroll_period_id.value,
      office_id: office_id.value,
      bank_account_id: bank_account_id.value,
      status: status.value,
      search: search.value,
    })

    if (error) {
      console.error('[usePayrollBatches] fetch:', error.message)
      toast.error('Failed to load payroll batches', {
        description: 'Please check your connection and refresh the page.',
      })
    } else {
      payrollBatches.value = data
      totalCount.value = count
    }

    isLoading.value = false
  }

  // Reset page when any filter changes
  watch([payroll_period_id, office_id, bank_account_id, status], () => {
    if (page.value === 1) {
      fetchPayrollBatches()
    } else {
      page.value = 1
    }
  })

  watch([page, pageSize], fetchPayrollBatches, { immediate: true })

  // Debounced watch for search input, reset page if not at 1
  watchDebounced(
    search,
    () => {
      if (page.value === 1) {
        fetchPayrollBatches()
      } else {
        page.value = 1
      }
    },
    { debounce: 300 },
  )

  async function addPayrollBatch(
    periodId: number,
    officeId: number | null,
    bankAccountId: number | null,
    desc: string | null,
  ) {
    const { error } = await createPayrollBatch({
      payroll_period_id: periodId,
      office_id: officeId,
      bank_account_id: bankAccountId,
      description: desc,
    })

    if (error) {
      console.error('[usePayrollBatches] create:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to create payroll batch.',
      })
    } else {
      await fetchPayrollBatches()
      toast.success('Payroll batch successfully created!')
    }
  }

  async function editPayrollBatch(
    id: number,
    periodId: number,
    officeId: number | null,
    bankAccountId: number | null,
    desc: string | null,
  ) {
    const { error } = await updatePayrollBatch(id, {
      payroll_period_id: periodId,
      office_id: officeId,
      bank_account_id: bankAccountId,
      description: desc,
    })

    if (error) {
      console.error('[usePayrollBatches] update:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to update payroll batch.',
      })
    } else {
      await fetchPayrollBatches()
      toast.success('Payroll batch successfully updated!')
    }
  }

  async function removePayrollBatch(id: number) {
    const { error } = await deletePayrollBatch(id)
    if (error) {
      console.error('[usePayrollBatches] delete:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to delete payroll batch.',
      })
    } else {
      await fetchPayrollBatches()
      toast.success('Payroll batch successfully deleted!')
    }
  }

  return {
    payrollBatches,
    totalCount,
    isLoading,
    payroll_period_id,
    office_id,
    bank_account_id,
    status,
    search,
    page,
    pageSize,
    addPayrollBatch,
    editPayrollBatch,
    removePayrollBatch,
    fetchPayrollBatches,
  }
}
