<script setup lang="ts">
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
import Button from '@/components/ui/button/Button.vue'
import { Plus } from '@lucide/vue'

import { usePayrollPeriodDialogs } from '@/composables/payroll/usePayrollPeriodDialogs'
import { usePayrollPeriods } from '@/composables/payroll/usePayrollPeriods'
import type { PayrollPeriod } from '@/types/payroll-period.types'
import { payrollPeriodColumns } from './components/PayrollPeriodColumns.ts'
import PayrollPeriodDeleteDialog from './components/PayrollPeriodDeleteDialog.vue'
import PayrollPeriodMutateDrawer from './components/PayrollPeriodMutateDrawer.vue'
import PayrollPeriodTable from './components/PayrollPeriodTable.vue'

const {
  payrollPeriods,
  totalCount,
  isLoading,
  startDate,
  endDate,
  page,
  pageSize,
  addPayrollPeriod,
  editPayrollPeriod,
  removePayrollPeriod,
} = usePayrollPeriods()

const {
  formOpen,
  selectedPayrollPeriod,
  openCreate,
  openEdit,
  deleteOpen,
  payrollPeriodToDelete,
  openDelete,
} = usePayrollPeriodDialogs()

async function handleSubmit(data: { cutoff_start: string; cutoff_end: string }) {
  const { cutoff_start, cutoff_end } = data
  if (selectedPayrollPeriod.value) {
    await editPayrollPeriod(selectedPayrollPeriod.value.payroll_period_id, cutoff_start, cutoff_end)
  } else {
    await addPayrollPeriod(cutoff_start, cutoff_end)
  }
}

async function handleDelete(period: PayrollPeriod) {
  await removePayrollPeriod(period.payroll_period_id)
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
          <BreadcrumbPage>Payroll Periods</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Payroll Periods</h2>
        <p class="text-muted-foreground">Manage your payroll periods here.</p>
      </div>
      <Button class="space-x-1" @click="openCreate">
        <span>Create</span>
        <Plus :size="18" />
      </Button>
    </div>

    <PayrollPeriodTable
      :columns="payrollPeriodColumns"
      :data="payrollPeriods"
      :is-loading="isLoading"
      :total-count="totalCount"
      v-model:page-size="pageSize"
      v-model:start-date="startDate"
      v-model:end-date="endDate"
      v-model:page="page"
      @edit="openEdit"
      @delete="openDelete"
    />
  </Main>

  <PayrollPeriodMutateDrawer
    v-model:open="formOpen"
    :row="selectedPayrollPeriod"
    @submit="handleSubmit"
  />
  <PayrollPeriodDeleteDialog
    v-model:open="deleteOpen"
    :row="payrollPeriodToDelete"
    @confirm="handleDelete"
  />
</template>
