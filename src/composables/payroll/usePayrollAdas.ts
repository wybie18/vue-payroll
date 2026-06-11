import { ref, watch } from 'vue'
import {
  listPayrollAdas,
  createPayrollAda,
  updatePayrollAda,
  deletePayrollAda,
} from '@/services/payroll-ada.service'
import type { PayrollAda, PayrollAdaWithDetails } from '@/types/payroll-ada.types'
import { toast } from 'vue-sonner'

export function usePayrollAdas() {
  const payrollAdas = ref<PayrollAdaWithDetails[]>([])
  const totalCount = ref(0)
  const isLoading = ref(false)

  const payroll_period_id = ref<number | null>(null)
  const bank_account_id = ref<number | null>(null)
  const status = ref<string | null>(null)

  const page = ref(1)
  const pageSize = ref(10)

  async function fetchPayrollAdas() {
    isLoading.value = true

    const { data, count, error } = await listPayrollAdas({
      page: page.value,
      pageSize: pageSize.value,
      payroll_period_id: payroll_period_id.value,
      bank_account_id: bank_account_id.value,
      status: status.value,
    })

    if (error) {
      console.error('[usePayrollAdas] fetch:', error.message)
      toast.error('Failed to load payroll ADAs', {
        description: 'Please check your connection and refresh the page.',
      })
    } else {
      payrollAdas.value = data
      totalCount.value = count
    }

    isLoading.value = false
  }

  // Reset page when any filter changes
  watch([payroll_period_id, bank_account_id, status], () => {
    page.value = 1
    fetchPayrollAdas()
  })

  watch([page, pageSize], fetchPayrollAdas)

  // Initial fetch
  Promise.all([fetchPayrollAdas()])

  async function addPayrollAda(
    payrollPeriodId: number,
    bankAccountId: number,
    adaDate: string,
    statusVal: string,
    compensationType: PayrollAda['compensation_type'],
  ) {
    const { error } = await createPayrollAda({
      payroll_period_id: payrollPeriodId,
      bank_account_id: bankAccountId,
      ada_date: adaDate,
      status: statusVal,
      compensation_type: compensationType,
    })

    if (error) {
      console.error('[usePayrollAdas] create:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to create ADA.',
      })
    } else {
      await fetchPayrollAdas()
      toast.success('ADA successfully created!')
    }
  }

  async function editPayrollAda(
    id: number,
    payrollPeriodId: number,
    bankAccountId: number,
    adaDate: string,
    statusVal: string,
    compensationType: PayrollAda['compensation_type'],
  ) {
    const { error } = await updatePayrollAda(id, {
      payroll_period_id: payrollPeriodId,
      bank_account_id: bankAccountId,
      ada_date: adaDate,
      status: statusVal,
      compensation_type: compensationType,
    })

    if (error) {
      console.error('[usePayrollAdas] update:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to update ADA.',
      })
    } else {
      await fetchPayrollAdas()
      toast.success('ADA successfully updated!')
    }
  }

  async function removePayrollAda(id: number) {
    const { error } = await deletePayrollAda(id)
    if (error) {
      console.error('[usePayrollAdas] delete:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to delete ADA.',
      })
    } else {
      await fetchPayrollAdas()
      toast.success('ADA successfully deleted!')
    }
  }

  return {
    payrollAdas,
    totalCount,
    isLoading,
    payroll_period_id,
    bank_account_id,
    status,
    page,
    pageSize,
    addPayrollAda,
    editPayrollAda,
    removePayrollAda,
    fetchPayrollAdas,
  }
}
