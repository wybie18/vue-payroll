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
import { ChevronDown, Download, Plus, Printer } from '@lucide/vue'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePayrollAdaBatchDialogs } from '@/composables/payroll/usePayrollAdaBatchDialogs'
import { usePayrollAdaBatches } from '@/composables/payroll/usePayrollAdaBatches'
import { useAdaExport } from '@/composables/payroll/useAdaExport'
import { useAdaPrint } from '@/composables/payroll/useAdaPrint'
import type { PayrollAdaBatchWithRelations } from '@/types/payroll-ada-batch.types'
import { payrollAdaBatchColumns } from './components/PayrollAdaBatchColumns'
import PayrollAdaBatchDeleteDialog from './components/PayrollAdaBatchDeleteDialog.vue'
import PayrollAdaBatchMutateDialog from './components/PayrollAdaBatchMutateDialog.vue'
import PayrollAdaBatchTable from './components/PayrollAdaBatchTable.vue'
import PayrollAdaBatchEmployeePayrollSheet from './components/PayrollAdaBatchEmployeePayrollSheet.vue'
import AdaProoflistPrint from './components/AdaProoflistPrint.vue'
import AdaFormPrint from './components/AdaFormPrint.vue'

const route = useRoute()
const adaNumber = computed(() => String(route.params.ada_number))
const adaId = computed(() => Number(route.params.ada_id))
const bankAccountId = computed(() => Number(route.params.bank_account_id))

const { adaBatches, totalCount, isLoading, page, pageSize, addAdaBatches, removeAdaBatch } =
  usePayrollAdaBatches(adaId)

const { isExporting, exportToText } = useAdaExport(adaId, adaNumber)
const { isPrinting, printData, printMode, printProoflist, printAdaForm } = useAdaPrint(adaId)

const { formOpen, openCreate, deleteOpen, adaBatchToDelete, openDelete } =
  usePayrollAdaBatchDialogs()

const employeePayrollOpen = ref(false)
const selectedBatchForDetails = ref<PayrollAdaBatchWithRelations | null>(null)

async function handleSubmit(batchIds: number[]) {
  await addAdaBatches(batchIds)
}

async function handleDelete(row: PayrollAdaBatchWithRelations) {
  await removeAdaBatch(row.id)
}

function handleShowEmployeePayroll(row: PayrollAdaBatchWithRelations) {
  selectedBatchForDetails.value = row
  employeePayrollOpen.value = true
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
        <h2 class="text-2xl font-bold tracking-tight">{{ adaNumber }}</h2>
        <p class="text-muted-foreground">Manage payroll batches associated with this ADA.</p>
      </div>
      <div class="flex items-center gap-2">
        <DropdownMenu :modal="false">
          <DropdownMenuTrigger as-child>
            <Button variant="outline" class="space-x-1" :disabled="isExporting || isPrinting">
              <span>{{ isExporting ? 'Exporting…' : isPrinting ? 'Opening…' : 'Actions' }}</span>
              <ChevronDown :size="16" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="exportToText">
              <Download :size="14" class="mr-2" />
              Export ADA
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="printProoflist">
              <Printer :size="14" class="mr-2" />
              Print DBP-Prooflist
            </DropdownMenuItem>
            <DropdownMenuItem @click="printAdaForm">
              <Printer :size="14" class="mr-2" />
              Print DBP-ADA
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button class="space-x-1" @click="openCreate">
          <span>Add Batch</span>
          <Plus :size="18" />
        </Button>
      </div>
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
  <PayrollAdaBatchEmployeePayrollSheet
    v-model:open="employeePayrollOpen"
    :batch="selectedBatchForDetails"
  />
  <Teleport to="body">
    <AdaProoflistPrint v-if="printMode === 'prooflist' && printData" :data="printData" />
    <AdaFormPrint v-if="printMode === 'ada' && printData" :data="printData" />
  </Teleport>
</template>
