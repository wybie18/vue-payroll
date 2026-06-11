import { ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { listOffices, createOffice, updateOffice, deleteOffice, getAllOffices, importOffices } from '@/services/office.service'
import type { Office, ListOfficesParams } from '@/types/office.types'
import { toast } from 'vue-sonner'

/**
 * Manages the commodities list: server-side pagination, debounced search,
 * and CRUD operations. All state lives here; components receive read-only
 * refs and typed handler functions.
 *
 * Note: listCommodities queries a view and does not return a row count, so
 * totalCount is tracked heuristically — we know if a full page came back
 * there may be more pages. Replace with a count query if the API adds one.
 */
export function useOffices() {
  // ─── List state ─────────────────────────────────────────────────────────────

  const offices = ref<Office[]>([])
  const totalCount = ref(0)
  const isLoading = ref(false)
  const search = ref('')
  const page = ref(1)
  const pageSize = ref(10)
  const allOffices = ref<Office[]>([])

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  async function fetchOffices() {
    isLoading.value = true

    const { data, count, error } = await listOffices({
      page: page.value,
      pageSize: pageSize.value,
      search: search.value,
    })

    if (error) {
      console.error('[useOffices] fetch:', error.message)
      toast.error('Failed to load offices', {
        description: 'Please check your connection and refresh the page.',
      })
    } else {
      offices.value = data
      totalCount.value = count
    }

    isLoading.value = false
  }

  async function fetchAllOffices() {
    const { data, error } = await getAllOffices()
    if (error) {
      console.error('[useOffices] fetchAll:', error.message)
      toast.error('Failed to load all offices')
    } else {
      allOffices.value = data
    }
  }

  // Debounce search and reset to page 1 on each new query
  watchDebounced(
    search,
    () => {
      page.value = 1
      fetchOffices()
    },
    { debounce: 300 },
  )

  // Re-fetch when page or pageSize changes
  watch([page, pageSize], fetchOffices)

  // Initial load
  Promise.all([fetchOffices()])

  // ─── CRUD handlers ──────────────────────────────────────────────────────────

  async function addOffice(
    office_code: string,
    office_name: string,
    abbreviation: string | null,
    status: string,
  ) {
    const { error } = await createOffice({
      office_code,
      office_name,
      abbreviation,
      status,
    })

    if (error) {
      console.error('[useOffices] create:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to create office.',
      })
    } else {
      await fetchOffices()
      toast.success('Office successfully created!')
    }
  }

  async function editOffice(
    office_id: number,
    office_code: string,
    office_name: string,
    abbreviation: string | null,
    status: string,
  ) {
    const { error } = await updateOffice(office_id, {
      office_code,
      office_name,
      abbreviation,
      status,
    })
    if (error) {
      console.error('[useOffices] update:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to update office.',
      })
    } else {
      await fetchOffices()
      toast.success('Office successfully updated!')
    }
  }

  async function removeOffice(office_id: number) {
    const { error } = await deleteOffice(office_id)
    if (error) {
      console.error('[useOffices] delete:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to delete office.',
      })
    } else {
      await fetchOffices()
      toast.success('Office successfully deleted!')
    }
  }

  async function bulkImportOffices(
    payload: Omit<Office, 'office_id' | 'created_at' | 'updated_at'>[],
  ) {
    isLoading.value = true
    const { error } = await importOffices(payload)
    isLoading.value = false

    if (error) {
      console.error('[useOffices] import:', error.message)
      toast.error('Something went wrong!', {
        description: 'Failed to import offices.',
      })
      return false
    } else {
      await fetchOffices()
      toast.success('Offices successfully imported!')
      return true
    }
  }

  return {
    // state
    offices,
    totalCount,
    isLoading,
    search,
    page,
    pageSize,
    allOffices,
    // actions
    addOffice,
    editOffice,
    removeOffice,
    bulkImportOffices,
    fetchOffices,
    fetchAllOffices,
  }
}
