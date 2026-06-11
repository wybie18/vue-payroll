<script setup lang="ts">
import { ref } from 'vue'
import { useBankDialogs } from '@/composables/banks/useBankDialogs'
import { useBanks } from '@/composables/banks/useBanks'
import type { Bank } from '@/types/bank.types'
import { bankColumns } from './components/BankColumns'
import BankDeleteDialog from './components/BankDeleteDialog.vue'
import BankMutateDrawer from './components/BankMutateDrawer.vue'
import BankImportDrawer from './components/BankImportDrawer.vue'
import BankTable from './components/BankTable.vue'
import Button from '@/components/ui/button/Button.vue'
import { Plus, FileUp } from '@lucide/vue'

const {
  banks,
  totalCount,
  isLoading,
  search,
  page,
  pageSize,
  addBank,
  editBank,
  removeBank,
  bulkImportBanks,
} = useBanks()

const importOpen = ref(false)

const { formOpen, selectedBank, openCreate, openEdit, deleteOpen, bankToDelete, openDelete } =
  useBankDialogs()

async function handleSubmit(data: {
  bank_name: string
  bank_abbreviation: string | null
  branch_name: string | null
  address: string | null
}) {
  const { bank_name, bank_abbreviation, branch_name, address } = data
  if (selectedBank.value) {
    await editBank(selectedBank.value.bank_id, bank_name, bank_abbreviation, branch_name, address)
  } else {
    await addBank(bank_name, bank_abbreviation, branch_name, address)
  }
}

async function handleDelete(bank: Bank) {
  await removeBank(bank.bank_id)
}

async function handleImportSubmit(payload: Omit<Bank, 'bank_id'>[]) {
  await bulkImportBanks(payload)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Banks</h2>
        <p class="text-muted-foreground">Manage your banks here.</p>
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

    <BankTable
      :columns="bankColumns"
      :data="banks"
      :is-loading="isLoading"
      :total-count="totalCount"
      v-model:page-size="pageSize"
      v-model:search="search"
      v-model:page="page"
      @edit="openEdit"
      @delete="openDelete"
    />

    <BankMutateDrawer v-model:open="formOpen" :row="selectedBank" @submit="handleSubmit" />
    <BankImportDrawer v-model:open="importOpen" @submit="handleImportSubmit" />
    <BankDeleteDialog v-model:open="deleteOpen" :row="bankToDelete" @confirm="handleDelete" />
  </div>
</template>
