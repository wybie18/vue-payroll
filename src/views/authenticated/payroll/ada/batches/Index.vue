<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
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

import { usePayrollAdaBatchDialogs } from '@/composables/payroll/usePayrollAdaBatchDialogs'
import { usePayrollAdaBatches } from '@/composables/payroll/usePayrollAdaBatches'
import type { PayrollAdaBatchWithRelations } from '@/types/payroll-ada-batch.types'
import { payrollAdaBatchColumns } from './components/PayrollAdaBatchColumns'
import PayrollAdaBatchDeleteDialog from './components/PayrollAdaBatchDeleteDialog.vue'
import PayrollAdaBatchMutateDialog from './components/PayrollAdaBatchMutateDialog.vue'
import PayrollAdaBatchTable from './components/PayrollAdaBatchTable.vue'

const route = useRoute()
const router = useRouter()
const adaNumber = computed(() => String(route.params.ada_number))
const adaId = computed(() => Number(route.params.ada_id))
const bankAccountId = computed(() => Number(route.params.bank_account_id))

const { adaBatches, totalCount, isLoading, page, pageSize, addAdaBatch, removeAdaBatch } =
  usePayrollAdaBatches(adaId)

const { formOpen, openCreate, deleteOpen, adaBatchToDelete, openDelete } =
  usePayrollAdaBatchDialogs()

async function handleSubmit(batchId: number) {
  await addAdaBatch(batchId)
}

async function handleDelete(row: PayrollAdaBatchWithRelations) {
  await removeAdaBatch(row.id)
}

function handleShowEmployeePayroll(row: PayrollAdaBatchWithRelations) {
  router.push({
    name: 'EmployeePayroll',
    params: { batch_code: row.batch_code, batch_id: row.batch_id },
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
          <BreadcrumbLink as-child>
            <RouterLink to="/payroll/ada">ADA Preparation</RouterLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ adaNumber }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Linked Payroll Batches</h2>
        <p class="text-muted-foreground">Manage payroll batches associated with this ADA.</p>
      </div>
      <Button class="space-x-1" @click="openCreate">
        <span>Add Batch</span>
        <Plus :size="18" />
      </Button>
    </div>

    <PayrollAdaBatchTable
      :columns="payrollAdaBatchColumns"
      :data="adaBatches"
      :is-loading="isLoading"
      :total-count="totalCount"
      v-model:page-size="pageSize"
      v-model:page="page"
      @delete="openDelete"
      @show-employee-payroll="handleShowEmployeePayroll"
    />
  </Main>

  <PayrollAdaBatchMutateDialog
    v-model:open="formOpen"
    :bank-account-id="bankAccountId"
    @submit="handleSubmit"
  />
  <PayrollAdaBatchDeleteDialog
    v-model:open="deleteOpen"
    :row="adaBatchToDelete"
    @confirm="handleDelete"
  />
</template>
