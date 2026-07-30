<script setup lang="ts">
import { ref } from 'vue'
import { useBankAccountDialogs } from '@/composables/banks/useBankAccountDialogs'
import { useBankAccounts } from '@/composables/banks/useBankAccounts'
import type { BankAccount } from '@/types/bank.types'
import { bankAccountColumns } from './components/BankAccountColumns'
import BankAccountDeleteDialog from './components/BankAccountDeleteDialog.vue'
import BankAccountMutateDrawer from './components/BankAccountMutateDrawer.vue'
import BankAccountImportDrawer from './components/BankAccountImportDrawer.vue'
import BankAccountTable from './components/BankAccountTable.vue'
import Button from '@/components/ui/button/Button.vue'
import { Plus, FileUp } from '@lucide/vue'

const {
  bankAccounts,
  totalCount,
  isLoading,
  search,
  page,
  pageSize,
  addBankAccount,
  editBankAccount,
  removeBankAccount,
  bulkImportBankAccounts,
} = useBankAccounts({ autoFetch: true })

const importOpen = ref(false)

const {
  formOpen,
  selectedBankAccount,
  openCreate,
  openEdit,
  deleteOpen,
  bankAccountToDelete,
  openDelete,
} = useBankAccountDialogs()

async function handleSubmit(data: {
  bank_id: number
  account_number: string
  fund_source: string
}) {
  const { bank_id, account_number, fund_source } = data
  const fundSource = fund_source as 'EE' | 'GF' | 'SH'
  if (selectedBankAccount.value) {
    await editBankAccount(
      selectedBankAccount.value.bank_account_id,
      bank_id,
      account_number,
      fundSource,
    )
  } else {
    await addBankAccount(bank_id, account_number, fundSource)
  }
}

async function handleDelete(account: BankAccount) {
  await removeBankAccount(account.bank_account_id)
}

async function handleImportSubmit(
  payload: { bank_id: number; account_number: string; fund_source: BankAccount['fund_source'] }[],
) {
  await bulkImportBankAccounts(payload)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Bank Accounts</h2>
        <p class="text-muted-foreground">Manage your bank accounts here.</p>
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

    <BankAccountTable
      :columns="bankAccountColumns"
      :data="bankAccounts"
      :is-loading="isLoading"
      :total-count="totalCount"
      v-model:page-size="pageSize"
      v-model:search="search"
      v-model:page="page"
      @edit="openEdit"
      @delete="openDelete"
    />

    <BankAccountMutateDrawer
      v-model:open="formOpen"
      :row="selectedBankAccount"
      @submit="handleSubmit"
    />
    <BankAccountImportDrawer v-model:open="importOpen" @submit="handleImportSubmit" />
    <BankAccountDeleteDialog
      v-model:open="deleteOpen"
      :row="bankAccountToDelete"
      @confirm="handleDelete"
    />
  </div>
</template>
