import { ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { listBanks, createBank, updateBank, deleteBank, importBanks } from '@/services/bank.service'
import type { Bank } from '@/types/bank.types'
import { toast } from 'vue-sonner'

export function useBanks() {
  const banks = ref<Bank[]>([])
  const totalCount = ref(0)
  const isLoading = ref(false)
  const search = ref('')
  const page = ref(1)
  const pageSize = ref(10)

  async function fetchBanks() {
    isLoading.value = true

    const { data, count, error } = await listBanks({
      page: page.value,
      pageSize: pageSize.value,
      search: search.value,
    })

    if (error) {
      console.error('[useBanks] fetch:', error.message)
      toast.error('Failed to load banks', {
        description: 'Please check your connection and refresh the page.',
      })
    } else {
      banks.value = data
      totalCount.value = count
    }

    isLoading.value = false
  }

  watchDebounced(
    search,
    () => {
      page.value = 1
      fetchBanks()
    },
    { debounce: 300 },
  )

  watch([page, pageSize], fetchBanks)

  Promise.all([fetchBanks()])

  async function addBank(
    bank_name: string,
    bank_abbreviation: string | null,
    branch_name: string | null,
    address: string | null,
  ) {
    const { error } = await createBank({
      bank_name,
      bank_abbreviation,
      branch_name,
      address,
    })

    if (error) {
      console.error('[useBanks] create:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to create bank.',
      })
    } else {
      await fetchBanks()
      toast.success('Bank successfully created!')
    }
  }

  async function editBank(
    bank_id: number,
    bank_name: string,
    bank_abbreviation: string | null,
    branch_name: string | null,
    address: string | null,
  ) {
    const { error } = await updateBank(bank_id, {
      bank_name,
      bank_abbreviation,
      branch_name,
      address,
    })
    if (error) {
      console.error('[useBanks] update:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to update bank.',
      })
    } else {
      await fetchBanks()
      toast.success('Bank successfully updated!')
    }
  }

  async function removeBank(bank_id: number) {
    const { error } = await deleteBank(bank_id)
    if (error) {
      console.error('[useBanks] delete:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to delete bank. Make sure there are no linked accounts.',
      })
    } else {
      await fetchBanks()
      toast.success('Bank successfully deleted!')
    }
  }

  async function bulkImportBanks(
    payload: Omit<Bank, 'bank_id'>[],
  ) {
    isLoading.value = true
    const { error } = await importBanks(payload)
    isLoading.value = false

    if (error) {
      console.error('[useBanks] import:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to import banks.',
      })
      return false
    } else {
      await fetchBanks()
      toast.success('Banks successfully imported!')
      return true
    }
  }

  return {
    banks,
    totalCount,
    isLoading,
    search,
    page,
    pageSize,
    addBank,
    editBank,
    removeBank,
    bulkImportBanks,
    fetchBanks
  }
}
