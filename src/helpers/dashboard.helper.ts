import type { DashboardMetrics } from '@/types/dashboard.types'

export function mapDashboardMetrics(data: any): DashboardMetrics {
  const kpis = data?.kpis || {}
  const alerts = data?.alerts || {}
  const charts = data?.charts || {}

  return {
    kpis: {
      total_active_employees: kpis.total_active_employees ?? 0,
      current_month_payroll: kpis.current_month_payroll ?? 0,
      pending_batches: kpis.pending_batches ?? 0,
      pending_adas: kpis.pending_adas ?? 0,
    },
    alerts: {
      recent_audit_logs: Array.isArray(alerts.recent_audit_logs)
        ? alerts.recent_audit_logs.map((log: any) => ({
            action: log.action ?? '',
            table_name: log.table_name ?? '',
            first_name: log.first_name ?? null,
            last_name: log.last_name ?? null,
            changed_at: log.changed_at ?? '',
          }))
        : [],
      unassigned_batches: Array.isArray(alerts.unassigned_batches)
        ? alerts.unassigned_batches.map((batch: any) => ({
            batch_id: batch.batch_id ?? 0,
            batch_code: batch.batch_code ?? '',
            description: batch.description ?? null,
            cutoff_start: batch.cutoff_start ?? '',
            cutoff_end: batch.cutoff_end ?? '',
          }))
        : [],
    },
    charts: {
      payroll_by_office: Array.isArray(charts.payroll_by_office)
        ? charts.payroll_by_office.map((item: any) => ({
            office: item.office ?? '',
            office_name: item.office_name ?? '',
            total_pay: item.total_pay ?? 0,
          }))
        : [],
      payroll_trend_6_months: Array.isArray(charts.payroll_trend_6_months)
        ? charts.payroll_trend_6_months.map((item: any) => ({
            month_label: item.month_label ?? '',
            month_sort: item.month_sort ?? '',
            total_pay: item.total_pay ?? 0,
          }))
        : [],
    },
  }
}
