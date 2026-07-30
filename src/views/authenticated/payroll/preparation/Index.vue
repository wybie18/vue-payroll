<!-- eslint-disable vue/multi-word-component-names -->
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
import { RouterLink, useRouter } from 'vue-router'
import Button from '@/components/ui/button/Button.vue'
import { Plus } from '@lucide/vue'

import { usePayrollBatchDialogs } from '@/composables/payroll/usePayrollBatchDialogs'
import { usePayrollBatches } from '@/composables/payroll/usePayrollBatches'
import type { PayrollBatchWithRelations } from '@/types/payroll-batch.types'
import { payrollBatchColumns } from './components/PayrollBatchColumns'
import PayrollBatchDeleteDialog from './components/PayrollBatchDeleteDialog.vue'
import PayrollBatchMutateDrawer from './components/PayrollBatchMutateDrawer.vue'
import PayrollBatchTable from './components/PayrollBatchTable.vue'

const router = useRouter()

const {
  payrollBatches,
  totalCount,
  isLoading,
  payroll_period_id,
  office_id,
  bank_account_id,
  status,
  search,
  page,
  pageSize,
  addPayrollBatch,
  editPayrollBatch,
  removePayrollBatch,
} = usePayrollBatches()

const {
  formOpen,
  selectedPayrollBatch,
  openCreate,
  openEdit,
  deleteOpen,
  payrollBatchToDelete,
  openDelete,
} = usePayrollBatchDialogs()

async function handleSubmit(data: {
  payroll_period_id: number
  office_id: number | null
  bank_account_id: number | null
}) {
  const { payroll_period_id, office_id, bank_account_id } = data
  if (selectedPayrollBatch.value) {
    await editPayrollBatch(
      selectedPayrollBatch.value.batch_id,
      payroll_period_id,
      office_id,
      bank_account_id,
    )
  } else {
    await addPayrollBatch(payroll_period_id, office_id, bank_account_id)
  }
}

async function handleDelete(batch: PayrollBatchWithRelations) {
  await removePayrollBatch(batch.batch_id)
}

function handleShow(batch: PayrollBatchWithRelations) {
  router.push({
    name: 'EmployeePayroll',
    params: { batch_code: batch.batch_code, batch_id: batch.batch_id },
  })
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
          <BreadcrumbPage>Payroll Preparation</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Payroll Batches</h2>
        <p class="text-muted-foreground">Manage your payroll batches here.</p>
      </div>
      <Button class="space-x-1" @click="openCreate">
        <span>Create</span>
        <Plus :size="18" />
      </Button>
    </div>

    <PayrollBatchTable
      :columns="payrollBatchColumns"
      :data="payrollBatches"
      :is-loading="isLoading"
      :total-count="totalCount"
      v-model:page-size="pageSize"
      v-model:payroll-period-id="payroll_period_id"
      v-model:office-id="office_id"
      v-model:bank-account-id="bank_account_id"
      v-model:status="status"
      v-model:search="search"
      v-model:page="page"
      @edit="openEdit"
      @delete="openDelete"
      @show-employee-payroll="handleShow"
    />
  </Main>

  <PayrollBatchMutateDrawer
    v-model:open="formOpen"
    :row="selectedPayrollBatch"
    @submit="handleSubmit"
  />
  <PayrollBatchDeleteDialog
    v-model:open="deleteOpen"
    :row="payrollBatchToDelete"
    @confirm="handleDelete"
  />
</template>
