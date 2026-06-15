export interface DashboardMetrics {
  kpis: {
    total_active_employees: number
    current_month_payroll: number
    pending_batches: number
    pending_adas: number
  }
  alerts: {
    recent_audit_logs: Array<{
      action: string
      table_name: string
      first_name: string | null
      last_name: string | null
      changed_at: string
    }>
    unassigned_batches: Array<{
      batch_id: number
      batch_code: string
      description: string | null
      cutoff_start: string
      cutoff_end: string
    }>
  }
  charts: {
    payroll_by_office: Array<{ office: string; office_name: string; total_pay: number }>
    payroll_trend_6_months: Array<{ month_label: string; month_sort: string; total_pay: number }>
  }
}
