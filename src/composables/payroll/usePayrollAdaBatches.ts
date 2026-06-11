import { ref, watch, type Ref } from 'vue'
import {
  listAdaBatches,
  createAdaBatch,
  deleteAdaBatch,
} from '@/services/payroll-ada-batch.service'
import type { PayrollAdaBatchWithRelations } from '@/types/payroll-ada-batch.types'
import { toast } from 'vue-sonner'

export function usePayrollAdaBatches(adaId: Ref<number | null>) {
  const adaBatches = ref<PayrollAdaBatchWithRelations[]>([])
  const totalCount = ref(0)
  const isLoading = ref(false)

  const page = ref(1)
  const pageSize = ref(10)

  async function fetchAdaBatches() {
    if (!adaId.value) {
      adaBatches.value = []
      totalCount.value = 0
      return
    }

    isLoading.value = true

    const { data, count, error } = await listAdaBatches(
      page.value,
      pageSize.value,
      adaId.value,
    )

    if (error) {
      console.error('[usePayrollAdaBatches] fetch:', error.message)
      toast.error('Failed to load ADA batches', {
        description: 'Please check your connection and refresh the page.',
      })
    } else {
      adaBatches.value = data ?? []
      totalCount.value = count ?? 0
    }

    isLoading.value = false
  }

  // Reset page when ADA ID changes
  watch(adaId, () => {
    page.value = 1
    fetchAdaBatches()
  }, { immediate: true })

  // Refetch when page or pageSize changes
  watch([page, pageSize], fetchAdaBatches)

  async function addAdaBatch(batchId: number) {
    if (!adaId.value) return

    // Prevent linking the same batch twice if it's already linked
    if (adaBatches.value.some((b) => b.batch_id === batchId)) {
      toast.warning('This batch is already linked to this ADA.')
      return
    }

    const { error } = await createAdaBatch(adaId.value, { batch_id: batchId })

    if (error) {
      console.error('[usePayrollAdaBatches] create:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to link batch to ADA.',
      })
    } else {
      await fetchAdaBatches()
      toast.success('Batch successfully linked!')
    }
  }

  async function removeAdaBatch(id: number) {
    const { error } = await deleteAdaBatch(id)
    if (error) {
      console.error('[usePayrollAdaBatches] delete:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to unlink batch.',
      })
    } else {
      await fetchAdaBatches()
      toast.success('Batch successfully unlinked!')
    }
  }

  return {
    adaBatches,
    totalCount,
    isLoading,
    page,
    pageSize,
    addAdaBatch,
    removeAdaBatch,
    fetchAdaBatches,
  }
}
