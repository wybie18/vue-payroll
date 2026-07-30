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

import { usePayrollAdaDialogs } from '@/composables/payroll/usePayrollAdaDialogs'
import { usePayrollAdas } from '@/composables/payroll/usePayrollAdas'
import type { PayrollAda, PayrollAdaWithDetails } from '@/types/payroll-ada.types'
import { payrollAdaColumns } from './components/PayrollAdaColumns.ts'
import PayrollAdaDeleteDialog from './components/PayrollAdaDeleteDialog.vue'
import PayrollAdaMutateDrawer from './components/PayrollAdaMutateDrawer.vue'
import PayrollAdaTable from './components/PayrollAdaTable.vue'

const router = useRouter()

const {
  payrollAdas,
  totalCount,
  isLoading,
  payroll_period_id,
  bank_account_id,
  status,
  search,
  page,
  pageSize,
  addPayrollAda,
  editPayrollAda,
  removePayrollAda,
} = usePayrollAdas()

const {
  formOpen,
  selectedPayrollAda,
  openCreate,
  openEdit,
  deleteOpen,
  payrollAdaToDelete,
  openDelete,
} = usePayrollAdaDialogs()

async function handleSubmit(data: {
  payroll_period_id: number
  bank_account_id: number
  ada_date: string
  status: string
}) {
  const { payroll_period_id, bank_account_id, ada_date, status } = data
  if (selectedPayrollAda.value) {
    await editPayrollAda(
      selectedPayrollAda.value.ada_id,
      payroll_period_id,
      bank_account_id,
      ada_date,
      status,
    )
  } else {
    await addPayrollAda(payroll_period_id, bank_account_id, ada_date, status)
  }
}

async function handleDelete(ada: PayrollAdaWithDetails) {
  await removePayrollAda(ada.ada_id)
}

function handleShowBatches(ada: PayrollAdaWithDetails) {
  router.push({
    name: 'PayrollAdaBatches',
    params: {
      ada_number: ada.ada_number,
      ada_id: ada.ada_id,
      bank_account_id: ada.bank_account_id,
      payroll_period_id: ada.payroll_period_id,
    },
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
          <BreadcrumbPage>ADA Preparation</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">ADA Preparation</h2>
        <p class="text-muted-foreground">Manage your advice of debit account (ADA) batches here.</p>
      </div>
      <Button class="space-x-1" @click="openCreate">
        <span>Create</span>
        <Plus :size="18" />
      </Button>
    </div>

    <PayrollAdaTable
      :columns="payrollAdaColumns"
      :data="payrollAdas"
      :is-loading="isLoading"
      :total-count="totalCount"
      v-model:page-size="pageSize"
      v-model:payroll-period-id="payroll_period_id"
      v-model:bank-account-id="bank_account_id"
      v-model:status="status"
      v-model:search="search"
      v-model:page="page"
      @edit="openEdit"
      @delete="openDelete"
      @show-batches="handleShowBatches"
    />
  </Main>

  <PayrollAdaMutateDrawer
    v-model:open="formOpen"
    :row="selectedPayrollAda"
    @submit="handleSubmit"
  />
  <PayrollAdaDeleteDialog
    v-model:open="deleteOpen"
    :row="payrollAdaToDelete"
    @confirm="handleDelete"
  />
</template>
