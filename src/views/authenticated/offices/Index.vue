<script setup lang="ts">
import { ref } from 'vue'
import Main from '@/components/layouts/Main.vue'
import Button from '@/components/ui/button/Button.vue'
import Header from '@/components/ui/custom/Header.vue'
import ThemeSwitcher from '@/components/ui/custom/ThemeSwitcher.vue'
import { Plus, FileUp } from '@lucide/vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOfficeDialogs } from '@/composables/offices/useOfficeDialogs'
import { useOffices } from '@/composables/offices/useOffices'
import type { Office } from '@/types/office.types'
import { officeColumns } from './components/OfficeColumns'
import OfficeDeleteDialog from './components/OfficeDeleteDialog.vue'
import OfficeMutateDrawer from './components/OfficeMutateDrawer.vue'
import OfficeImportDrawer from './components/OfficeImportDrawer.vue'
import OfficeTable from './components/OfficeTable.vue'

const authStore = useAuthStore()

// ─── Data ─────────────────────────────────────────────────────────────────────

const {
  offices,
  totalCount,
  isLoading,
  search,
  page,
  pageSize,
  addOffice,
  editOffice,
  removeOffice,
  bulkImportOffices,
} = useOffices()

const importOpen = ref(false)

// ─── Dialogs ──────────────────────────────────────────────────────────────────

const { formOpen, selectedOffice, openCreate, openEdit, deleteOpen, officeToDelete, openDelete } =
  useOfficeDialogs()

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleSubmit(data: {
  office_code: string
  office_name: string
  abbreviation: string | null
  status: string
}) {
  const { office_code, office_name, abbreviation, status } = data
  if (selectedOffice.value) {
    await editOffice(selectedOffice.value.office_id, office_code, office_name, abbreviation, status)
  } else {
    await addOffice(office_code, office_name, abbreviation, status)
  }
}

async function handleDelete(office: Office) {
  await removeOffice(office.office_id)
}

async function handleImportSubmit(
  payload: Omit<Office, 'office_id' | 'created_at' | 'updated_at'>[],
) {
  await bulkImportOffices(payload)
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
          <BreadcrumbPage>Offices</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Offices</h2>
        <p class="text-muted-foreground">Manage your offices here.</p>
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

    <OfficeTable
      :columns="officeColumns"
      :data="offices"
      :is-loading="isLoading"
      :total-count="totalCount"
      v-model:page-size="pageSize"
      v-model:search="search"
      v-model:page="page"
      @edit="openEdit"
      @delete="openDelete"
    />
  </Main>

  <OfficeMutateDrawer v-model:open="formOpen" :row="selectedOffice" @submit="handleSubmit" />
  <OfficeImportDrawer v-model:open="importOpen" @submit="handleImportSubmit" />

  <OfficeDeleteDialog v-model:open="deleteOpen" :row="officeToDelete" @confirm="handleDelete" />
</template>
