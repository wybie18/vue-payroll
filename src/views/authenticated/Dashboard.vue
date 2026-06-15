<script setup lang="ts">
import { computed } from 'vue'
import Main from '@/components/layouts/Main.vue'
import Header from '@/components/ui/custom/Header.vue'
import ThemeSwitcher from '@/components/ui/custom/ThemeSwitcher.vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users2,
  Banknote,
  Layers,
  FileSignature,
  AlertCircle,
  Activity,
  PieChart,
  TrendingUp,
} from '@lucide/vue'
import PieChartComponent from '@/components/ui/custom/charts/PieChart.vue'
import SingleLineChartComponent from '@/components/ui/custom/charts/SingleLineChart.vue'
import { useDashboard } from '@/composables/useDashboard'

const { isLoading, kpis, recentAuditLogs, unassignedBatches, payrollByOffice, payrollTrend } =
  useDashboard()

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  })
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

function formatTableName(tableName: string): string {
  return tableName
    .replace(/^t_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const actionBadgeClass: Record<string, string> = {
  INSERT: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  UPDATE: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  DELETE: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
}

function actionClass(action: string): string {
  return actionBadgeClass[action] ?? 'bg-muted text-muted-foreground'
}

const hasAlerts = computed(() => unassignedBatches.value.length > 0)

const hasPieData = computed(() => payrollByOffice.value.length > 0)
const hasTrendData = computed(() => payrollTrend.value.length > 0)
</script>

<template>
  <!-- eslint-disable-next-line vue/multi-word-component-names -->
  <Header :fixed="true">
    <div class="ml-auto flex items-center gap-2">
      <ThemeSwitcher />
    </div>
  </Header>

  <Main class="flex flex-1 flex-col gap-6">
    <!-- Page heading -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground text-sm">Overview of your payroll system.</p>
      </div>
    </div>

    <!-- ── KPI Cards ──────────────────────────────────────────────────────── -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total Active Employees -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Active Employees</CardTitle>
          <Users2 class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton v-if="isLoading" class="h-8 w-24" />
          <div v-else class="text-2xl font-bold">
            {{ kpis?.total_active_employees.toLocaleString() ?? '—' }}
          </div>
          <p class="text-muted-foreground text-xs mt-1">Currently active staff</p>
        </CardContent>
      </Card>

      <!-- Current Month Payroll -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Current Month Payroll</CardTitle>
          <Banknote class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton v-if="isLoading" class="h-8 w-32" />
          <div v-else class="text-2xl font-bold">
            {{ kpis != null ? formatCurrency(kpis.current_month_payroll) : '—' }}
          </div>
          <p class="text-muted-foreground text-xs mt-1">Total disbursed this month</p>
        </CardContent>
      </Card>

      <!-- Pending Batches -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Pending Batches</CardTitle>
          <Layers class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton v-if="isLoading" class="h-8 w-12" />
          <div v-else class="text-2xl font-bold">
            <span :class="kpis && kpis.pending_batches > 0 ? 'text-amber-500' : ''">
              {{ kpis?.pending_batches ?? '—' }}
            </span>
          </div>
          <p class="text-muted-foreground text-xs mt-1">Batches awaiting processing</p>
        </CardContent>
      </Card>

      <!-- Pending ADAs -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Pending ADAs</CardTitle>
          <FileSignature class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton v-if="isLoading" class="h-8 w-12" />
          <div v-else class="text-2xl font-bold">
            <span :class="kpis && kpis.pending_adas > 0 ? 'text-amber-500' : ''">
              {{ kpis?.pending_adas ?? '—' }}
            </span>
          </div>
          <p class="text-muted-foreground text-xs mt-1">ADAs awaiting approval</p>
        </CardContent>
      </Card>
    </div>

    <!-- ── Charts Row ─────────────────────────────────────────────────────── -->
    <div class="grid gap-4 lg:grid-cols-3">
      <!-- Payroll Trend -->
      <Card class="lg:col-span-2">
        <CardHeader class="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle class="flex items-center gap-2 text-base">
              <TrendingUp class="h-4 w-4" />
              Payroll Trend
            </CardTitle>
            <CardDescription>6-month payroll disbursement</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton v-if="isLoading" class="h-64 w-full rounded-lg" />
          <div
            v-else-if="!hasTrendData"
            class="h-64 flex items-center justify-center text-muted-foreground text-sm"
          >
            No trend data available.
          </div>
          <SingleLineChartComponent
            v-else
            :data="payrollTrend"
            date-key="month_sort"
            value-key="total_pay"
            label-key="month_label"
            label="Total Payroll"
            :show-area="true"
          />
        </CardContent>
      </Card>

      <!-- Payroll by Office -->
      <Card>
        <CardHeader class="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle class="flex items-center gap-2 text-base">
              <PieChart class="h-4 w-4" />
              Payroll by Office
            </CardTitle>
            <CardDescription>Distribution for current month</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton v-if="isLoading" class="h-64 w-full rounded-lg" />
          <div
            v-else-if="!hasPieData"
            class="h-64 flex items-center justify-center text-muted-foreground text-sm"
          >
            No payroll data for this period.
          </div>
          <PieChartComponent
            v-else
            :data="payrollByOffice"
            category-key="office"
            label-key="office_name"
            value-key="total_pay"
          />
        </CardContent>
      </Card>
    </div>

    <!-- ── Alerts + Activity Row ──────────────────────────────────────────── -->
    <div class="grid gap-4 lg:grid-cols-2">
      <!-- Recent Activity -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Activity class="h-4 w-4" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest audit log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <!-- Loading skeleton -->
          <div v-if="isLoading" class="space-y-3">
            <Skeleton v-for="i in 5" :key="i" class="h-10 w-full" />
          </div>

          <!-- Empty state -->
          <p v-else-if="recentAuditLogs.length === 0" class="text-muted-foreground text-sm">
            No recent activity.
          </p>

          <!-- Activity list -->
          <ul v-else class="space-y-1 divide-y divide-border">
            <li
              v-for="(log, idx) in recentAuditLogs"
              :key="idx"
              class="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <!-- Action badge -->
              <span
                :class="[
                  'mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide shrink-0',
                  actionClass(log.action),
                ]"
              >
                {{ log.action }}
              </span>

              <!-- Detail -->
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium leading-tight truncate">
                  {{ formatTableName(log.table_name) }}
                </p>
                <p class="text-muted-foreground text-xs truncate">
                  by {{ [log.first_name, log.last_name].filter(Boolean).join(' ') || 'System' }}
                </p>
              </div>

              <!-- Time -->
              <span class="text-muted-foreground text-xs shrink-0 mt-0.5">
                {{ formatRelativeTime(log.changed_at) }}
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <!-- Alerts: Unassigned Batches -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <AlertCircle class="h-4 w-4" />
            Unassigned Batches
            <span
              v-if="!isLoading && unassignedBatches.length > 0"
              class="ml-auto rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400"
            >
              {{ unassignedBatches.length }}
            </span>
          </CardTitle>
          <CardDescription>Batches not yet linked to an ADA</CardDescription>
        </CardHeader>
        <CardContent>
          <!-- Loading skeleton -->
          <div v-if="isLoading" class="space-y-3">
            <Skeleton v-for="i in 3" :key="i" class="h-12 w-full" />
          </div>

          <!-- All clear -->
          <div
            v-else-if="!hasAlerts"
            class="flex flex-col items-center justify-center gap-2 py-8 text-center"
          >
            <div class="rounded-full bg-emerald-500/10 p-3">
              <Activity class="h-5 w-5 text-emerald-500" />
            </div>
            <p class="text-sm font-medium">All batches are assigned</p>
            <p class="text-muted-foreground text-xs">No pending batches require attention.</p>
          </div>

          <!-- Batch list -->
          <ul v-else class="space-y-1 divide-y divide-border">
            <li
              v-for="batch in unassignedBatches"
              :key="batch.batch_id"
              class="py-2.5 first:pt-0 last:pb-0"
            >
              <p class="text-sm font-medium">{{ batch.batch_code }}</p>
              <p class="text-muted-foreground text-xs truncate">
                {{ batch.description ?? 'No description' }}
                &nbsp;·&nbsp;
                {{ batch.cutoff_start }} – {{ batch.cutoff_end }}
              </p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </Main>
</template>
