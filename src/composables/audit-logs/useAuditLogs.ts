import { ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { listAuditLogs } from '@/services/audit-log.service'
import type { AuditLogWithProfile } from '@/types/audit-log.types'
import { toast } from 'vue-sonner'

export function useAuditLogs() {
  const auditLogs = ref<AuditLogWithProfile[]>([])
  const totalCount = ref(0)
  const isLoading = ref(false)
  const tableName = ref<string | null>(null)
  const action = ref<string | null>(null)
  const page = ref(1)
  const pageSize = ref(10)

  async function fetchAuditLogs() {
    isLoading.value = true

    const { data, count, error } = await listAuditLogs({
      page: page.value,
      pageSize: pageSize.value,
      tableName: tableName.value,
      action: action.value,
    })

    if (error) {
      console.error('[useAuditLogs] fetch:', error.message)
      toast.error('Failed to load audit logs', {
        description: 'Please check your connection and refresh the page.',
      })
    } else {
      auditLogs.value = data
      totalCount.value = count
    }

    isLoading.value = false
  }

  // Reset page when action changes (select dropdown, immediate)
  watch(action, () => {
    if (page.value === 1) {
      fetchAuditLogs()
    } else {
      page.value = 1
    }
  })

  // Debounced watch for tableName search input
  watchDebounced(
    tableName,
    () => {
      if (page.value === 1) {
        fetchAuditLogs()
      } else {
        page.value = 1
      }
    },
    { debounce: 300 },
  )

  // Watch page and pageSize changes immediately
  watch([page, pageSize], fetchAuditLogs, { immediate: true })

  return {
    auditLogs,
    totalCount,
    isLoading,
    tableName,
    action,
    page,
    pageSize,
    fetchAuditLogs,
  }
}
