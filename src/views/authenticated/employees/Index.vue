<!-- eslint-disable vue/multi-word-component-names -->
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
import Button from '@/components/ui/button/Button.vue'
import { Plus, FileUp } from '@lucide/vue'

import { useEmployeeDialogs } from '@/composables/employees/useEmployeeDialogs'
import { useEmployees } from '@/composables/employees/useEmployees'
import type { Employee } from '@/types/employee.types'
import { employeeColumns } from './components/EmployeeColumns'
import EmployeeDeleteDialog from './components/EmployeeDeleteDialog.vue'
import EmployeeMutateDrawer from './components/EmployeeMutateDrawer.vue'
import EmployeeImportDrawer from './components/EmployeeImportDrawer.vue'
import EmployeeTable from './components/EmployeeTable.vue'

const {
  employees,
  totalCount,
  isLoading,
  search,
  page,
  pageSize,
  officeId,
  status,
  employmentStatus,
  addEmployee,
  editEmployee,
  removeEmployee,
  bulkImportEmployees,
} = useEmployees()

const importOpen = ref(false)

const { formOpen, selectedEmployee, openCreate, openEdit, deleteOpen, employeeToDelete, openDelete } =
  useEmployeeDialogs()

async function handleSubmit(data: {
  name: string
  office_id: number
  bank_account_id: number
  account_no: string
  status: string
  employee_no: string
  eenggas_no: string
  employment_status: Employee['employment_status']
}) {
  const { name, office_id, bank_account_id, account_no, status, employee_no, eenggas_no, employment_status } = data
  if (selectedEmployee.value) {
    await editEmployee(
      selectedEmployee.value.id,
      name,
      office_id,
      bank_account_id,
      account_no,
      status,
      employee_no,
      eenggas_no,
      employment_status
    )
  } else {
    await addEmployee(name, office_id, bank_account_id, account_no, status, employee_no, eenggas_no, employment_status)
  }
}

async function handleDelete(employee: Employee) {
  await removeEmployee(employee.id)
}

async function handleImportSubmit(
  payload: Omit<Employee, 'id' | 'created_at' | 'updated_at'>[],
) {
  await bulkImportEmployees(payload)
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
          <BreadcrumbPage>Employees</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Employees</h2>
        <p class="text-muted-foreground">Manage your employees here.</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" class="space-x-1" @click="importOpen = true">
          <span>Import</span>
          <FileUp :size="18" />
        </Button>
        <Button class="space-x-1" @click="openCreate">
          <span>Create</span>
          <Plus :size="18" />
        </Button>
      </div>
    </div>

    <EmployeeTable
      :columns="employeeColumns"
      :data="employees"
      :is-loading="isLoading"
      :total-count="totalCount"
      v-model:page-size="pageSize"
      v-model:search="search"
      v-model:page="page"
      v-model:office-id="officeId"
      v-model:status="status"
      v-model:employment-status="employmentStatus"
      @edit="openEdit"
      @delete="openDelete"
    />
  </Main>

  <EmployeeMutateDrawer v-model:open="formOpen" :row="selectedEmployee" @submit="handleSubmit" />
  <EmployeeImportDrawer v-model:open="importOpen" @submit="handleImportSubmit" />
  <EmployeeDeleteDialog v-model:open="deleteOpen" :row="employeeToDelete" @confirm="handleDelete" />
</template>
