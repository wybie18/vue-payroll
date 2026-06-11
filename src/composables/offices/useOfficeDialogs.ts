import { ref } from 'vue'
import type { Office } from '@/types/office.types'

/**
 * Manages the open/closed and selected-row state for the create/edit dialog
 * and the delete confirmation dialog. Keeps dialog concerns out of the view
 * and the data composable.
 */
export function useOfficeDialogs() {
  // ─── Create / Edit dialog ───────────────────────────────────────────────────

  const formOpen = ref(false)
  const selectedOffice = ref<Office | null>(null)

  function openCreate() {
    selectedOffice.value = null
    formOpen.value = true
  }

  function openEdit(office: Office) {
    selectedOffice.value = office
    formOpen.value = true
  }

  // ─── Delete dialog ──────────────────────────────────────────────────────────

  const deleteOpen = ref(false)
  const officeToDelete = ref<Office | null>(null)

  function openDelete(office: Office) {
    officeToDelete.value = office
    deleteOpen.value = true
  }

  return {
    // form dialog
    formOpen,
    selectedOffice,
    openCreate,
    openEdit,
    // delete dialog
    deleteOpen,
    officeToDelete,
    openDelete,
  }
}
