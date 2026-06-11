<script setup lang="ts">
import { ref, computed } from 'vue'
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
import { RouterLink } from 'vue-router'
import Button from '@/components/ui/button/Button.vue'
import { Plus, FileUp } from '@lucide/vue'

import { useEmployeePayrollDialogs } from '@/composables/payroll/useEmployeePayrollDialogs'
import { useEmployeePayrolls } from '@/composables/payroll/useEmployeePayrolls'
import type { EmployeePayrollWithEmployee } from '@/types/employee-payroll.types'
import { employeePayrollColumns } from './components/EmployeePayrollColumns'
import EmployeePayrollDeleteDialog from './components/EmployeePayrollDeleteDialog.vue'
import EmployeePayrollMutateDrawer from './components/EmployeePayrollMutateDrawer.vue'
import EmployeePayrollImportDrawer from './components/EmployeePayrollImportDrawer.vue'
import EmployeePayrollTable from './components/EmployeePayrollTable.vue'

const route = useRoute()
const batchCode = computed(() => String(route.params.batch_code))
const batchId = computed(() => Number(route.params.batch_id))

const {
  employeePayrolls,
  totalCount,
  isLoading,
  page,
  pageSize,
  addEmployeePayroll,
  editEmployeePayroll,
  removeEmployeePayroll,
  bulkImportEmployeePayrolls,
} = useEmployeePayrolls(batchId)

const importOpen = ref(false)

const {
  formOpen,
  selectedEmployeePayroll,
  openCreate,
  openEdit,
  deleteOpen,
  employeePayrollToDelete,
  openDelete,
} = useEmployeePayrollDialogs()

async function handleSubmit(data: {
  employee_id: number
  account_no: string
  net_pay: number
  bank_account_id: number | null
}) {
  const { employee_id, account_no, net_pay, bank_account_id } = data
  if (selectedEmployeePayroll.value) {
    await editEmployeePayroll(
      selectedEmployeePayroll.value.id,
      employee_id,
      account_no,
      net_pay,
      bank_account_id,
    )
  } else {
    await addEmployeePayroll(employee_id, account_no, net_pay, bank_account_id)
  }
}

async function handleDelete(payroll: EmployeePayrollWithEmployee) {
  await removeEmployeePayroll(payroll.id)
}

async function handleImportSubmit(payload: {
  employee_id: number
  account_no: string
  net_pay: number
  bank_account_id: number | null
}[]) {
  await bulkImportEmployeePayrolls(payload)
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
            <RouterLink to="/payroll/preparation">Payroll Preparation</RouterLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{{ batchCode }}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Employee Payrolls</h2>
        <p class="text-muted-foreground">Manage employees included in this batch.</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" class="space-x-1" @click="importOpen = true">
          <span>Import</span>
          <FileUp :size="18" />
        </Button>
        <Button class="space-x-1" @click="openCreate">
          <span>Add Employee</span>
          <Plus :size="18" />
        </Button>
      </div>
    </div>

    <EmployeePayrollTable
      :columns="employeePayrollColumns"
      :data="employeePayrolls"
      :is-loading="isLoading"
      :total-count="totalCount"
      v-model:page-size="pageSize"
      v-model:page="page"
      @edit="openEdit"
      @delete="openDelete"
    />
  </Main>

  <EmployeePayrollMutateDrawer
    v-model:open="formOpen"
    :row="selectedEmployeePayroll"
    @submit="handleSubmit"
  />
  <EmployeePayrollImportDrawer
    v-model:open="importOpen"
    @submit="handleImportSubmit"
  />
  <EmployeePayrollDeleteDialog
    v-model:open="deleteOpen"
    :row="employeePayrollToDelete"
    @confirm="handleDelete"
  />
</template>
