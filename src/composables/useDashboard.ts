import { ref, computed } from 'vue'
import { getDashboardMetrics } from '@/services/dashboard.service'
import type { DashboardMetrics } from '@/types/dashboard.types'
import { toast } from 'vue-sonner'

export function useDashboard() {
  const metrics = ref<DashboardMetrics | null>(null)
  const isLoading = ref(false)

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const kpis = computed(() => metrics.value?.kpis ?? null)

  // ── Alerts ─────────────────────────────────────────────────────────────────
  const recentAuditLogs = computed(() => metrics.value?.alerts.recent_audit_logs ?? [])
  const unassignedBatches = computed(() => metrics.value?.alerts.unassigned_batches ?? [])

  // ── Charts ─────────────────────────────────────────────────────────────────
  /** Only offices with total_pay > 0 for a clean pie chart */
  const payrollByOffice = computed(() =>
    (metrics.value?.charts.payroll_by_office ?? []).filter((o) => o.total_pay > 0),
  )

  const payrollTrend = computed(() => metrics.value?.charts.payroll_trend_6_months ?? [])

  // ── Fetch ──────────────────────────────────────────────────────────────────
  async function fetchMetrics() {
    isLoading.value = true

    const { data, error } = await getDashboardMetrics()

    if (error) {
      console.error('[useDashboard] fetch:', error.message)
      toast.error('Failed to load dashboard', {
        description: 'Could not retrieve metrics. Please refresh the page.',
      })
    } else {
      metrics.value = data
    }

    isLoading.value = false
  }

  fetchMetrics()

  return {
    isLoading,
    kpis,
    recentAuditLogs,
    unassignedBatches,
    payrollByOffice,
    payrollTrend,
    fetchMetrics,
  }
}
