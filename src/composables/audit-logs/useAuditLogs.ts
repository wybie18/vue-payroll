import { ref, watch } from 'vue'
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

  watch([page, pageSize, tableName, action], fetchAuditLogs)

  // Initial load
  Promise.all([fetchAuditLogs()])

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
