<script setup lang="ts">
import { ref } from 'vue'
import Main from '@/components/layouts/Main.vue'
import Header from '@/components/ui/custom/Header.vue'
import ThemeSwitcher from '@/components/ui/custom/ThemeSwitcher.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { RouterLink } from 'vue-router'
import { useAuditLogs } from '@/composables/audit-logs/useAuditLogs'
import type { AuditLogWithProfile } from '@/types/audit-log.types'
import { auditLogColumns } from './components/AuditLogColumns'
import AuditLogTable from './components/AuditLogTable.vue'
import AuditLogDetailSheet from './components/AuditLogDetailSheet.vue'

// ─── Data ─────────────────────────────────────────────────────────────────────

const {
  auditLogs,
  totalCount,
  isLoading,
  tableName,
  action,
  page,
  pageSize,
} = useAuditLogs()

// ─── Detail Drawer State ──────────────────────────────────────────────────────

const detailOpen = ref(false)
const selectedLog = ref<AuditLogWithProfile | null>(null)

function handleShow(row: AuditLogWithProfile) {
  selectedLog.value = row
  detailOpen.value = true
}
</script>

<template>
  <Header :fixed="true">
    <div class="ml-auto flex items-center gap-2">
      <ThemeSwitcher />
    </div>
  </Header>

  <Main class="flex flex-1 flex-col gap-4 sm:gap-6">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink as-child>
            <RouterLink to="/dashboard">Dashboard</RouterLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Audit Logs</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Audit Logs</h2>
        <p class="text-muted-foreground">View and analyze data changes across all tables.</p>
      </div>
    </div>

    <AuditLogTable
      :columns="auditLogColumns"
      :data="auditLogs"
      :is-loading="isLoading"
      :total-count="totalCount"
      v-model:page-size="pageSize"
      v-model:table-name="tableName"
      v-model:action="action"
      v-model:page="page"
      @show="handleShow"
    />
  </Main>

  <AuditLogDetailSheet v-model:open="detailOpen" :row="selectedLog" />
</template>
