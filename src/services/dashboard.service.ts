import { supabase } from '@/lib/supabase'
import type { DashboardMetrics } from '@/types/dashboard.types'
import type { ServiceResponse } from '@/types/response.types'
import { mapDashboardMetrics } from '@/helpers/dashboard.helper'

export async function getDashboardMetrics(): Promise<ServiceResponse<DashboardMetrics>> {
  const { data, error } = await supabase.rpc('fn_get_dashboard_metrics')

  const metrics: DashboardMetrics = mapDashboardMetrics(data)

  return { data: metrics, error }
}
