<script setup lang="ts" generic="TData">
import { ref, computed, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  FlexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { X, ChevronsUpDown, Check } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Pagination from '@/components/ui/custom/data-table/Pagination.vue'
import ViewOptions from '@/components/ui/custom/data-table/ViewOptions.vue'

import { useOffices } from '@/composables/offices/useOffices'
import { useBankAccounts } from '@/composables/banks/useBankAccounts'
import { usePayrollPeriods } from '@/composables/payroll/usePayrollPeriods'
import { formatDate } from '@/helpers/date.helper'

// ─── Props & Emits ────────────────────────────────────────────────────────────

interface Props {
  data: TData[]
  columns: ColumnDef<TData>[]
  isLoading?: boolean
  totalCount?: number
  pageSize?: number
  page?: number
  payrollPeriodId?: number | null
  officeId?: number | null
  bankAccountId?: number | null
  status?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  totalCount: 0,
  pageSize: 10,
  page: 1,
  payrollPeriodId: null,
  officeId: null,
  bankAccountId: null,
  status: null,
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:page-size': [pageSize: number]
  'update:payroll-period-id': [id: number | null]
  'update:office-id': [id: number | null]
  'update:bank-account-id': [id: number | null]
  'update:status': [status: string | null]
  'show-employee-payroll': [row: TData]
  edit: [row: TData]
  delete: [row: TData]
}>()

// ─── Filters Binding ──────────────────────────────────────────────────────────

const localPayrollPeriodId = computed({
  get: () => props.payrollPeriodId ?? null,
  set: (val) => emit('update:payroll-period-id', val),
})

const localOfficeId = computed({
  get: () => props.officeId ?? null,
  set: (val) => emit('update:office-id', val),
})

const localBankAccountId = computed({
  get: () => props.bankAccountId ?? null,
  set: (val) => emit('update:bank-account-id', val),
})

const localStatus = computed({
  get: () => props.status ?? null,
  set: (val) => emit('update:status', val),
})

const openPeriodPopover = ref(false)
const openOfficePopover = ref(false)
const openBankPopover = ref(false)

const { allOffices, fetchAllOffices } = useOffices()
const { allAccountsWithBank, fetchAllAccountsWithBank } = useBankAccounts()
const { payrollPeriods, fetchPayrollPeriods } = usePayrollPeriods()

onMounted(async () => {
  await Promise.all([fetchAllOffices(), fetchAllAccountsWithBank(), fetchPayrollPeriods()])
})

// ─── UI-only table state ──────────────────────────────────────────────────────

const sorting = ref<SortingState>([])
const columnVisibility = useStorage<VisibilityState>('payroll-batch-table-column-visibility', {})
const columnFilters = ref<ColumnFiltersState>([])

// ─── Derived: server-side page count ─────────────────────────────────────────

const pageCount = computed(() =>
  props.pageSize > 0 ? Math.ceil(props.totalCount / props.pageSize) : 0,
)

// ─── Table instance ───────────────────────────────────────────────────────────

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },

  state: {
    get sorting() {
      return sorting.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
    get columnFilters() {
      return columnFilters.value
    },
    get pagination() {
      return { pageIndex: props.page - 1, pageSize: props.pageSize }
    },
  },

  manualPagination: true,
  get pageCount() {
    return pageCount.value
  },

  onPaginationChange(updater) {
    const current = { pageIndex: props.page - 1, pageSize: props.pageSize }
    const next = typeof updater === 'function' ? updater(current) : updater
    if (next.pageIndex !== current.pageIndex) emit('update:page', next.pageIndex + 1)
    if (next.pageSize !== current.pageSize) emit('update:page-size', next.pageSize)
  },
  onSortingChange(updater) {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  onColumnVisibilityChange(updater) {
    columnVisibility.value =
      typeof updater === 'function' ? updater(columnVisibility.value) : updater
  },
  onColumnFiltersChange(updater) {
    columnFilters.value = typeof updater === 'function' ? updater(columnFilters.value) : updater
  },

  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),

  meta: {
    onShowEmployeePayroll: (row: TData) => emit('show-employee-payroll', row),
    onEdit: (row: TData) => emit('edit', row),
    onDelete: (row: TData) => emit('delete', row),
  },
})
</script>

<template>
  <div :class="cn('max-sm:has-[div[role=\'toolbar\']]:mb-16', 'flex flex-1 flex-col gap-4')">
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <!-- Payroll Period Filter -->
        <Popover v-model:open="openPeriodPopover">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="openPeriodPopover"
              class="h-8 justify-between min-w-55"
              :class="!localPayrollPeriodId && 'text-muted-foreground'"
            >
              {{
                localPayrollPeriodId
                  ? (() => {
                      const p = payrollPeriods.find(
                        (x) => x.payroll_period_id === localPayrollPeriodId,
                      )
                      return p
                        ? `${formatDate(p.cutoff_start)} - ${formatDate(p.cutoff_end)}`
                        : 'Unknown Period'
                    })()
                  : 'Filter by period...'
              }}
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-75 p-0">
            <Command>
              <CommandInput placeholder="Search period..." />
              <CommandEmpty>No period found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    v-for="period in payrollPeriods"
                    :key="period.payroll_period_id"
                    :value="period.payroll_period_id.toString()"
                    @select="
                      () => {
                        localPayrollPeriodId =
                          localPayrollPeriodId === period.payroll_period_id
                            ? null
                            : period.payroll_period_id
                        openPeriodPopover = false
                      }
                    "
                  >
                    <Check
                      :class="
                        cn(
                          'mr-2 h-4 w-4',
                          localPayrollPeriodId === period.payroll_period_id
                            ? 'opacity-100'
                            : 'opacity-0',
                        )
                      "
                    />
                    {{ formatDate(period.cutoff_start) }} - {{ formatDate(period.cutoff_end) }}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <!-- Office Filter -->
        <Popover v-model:open="openOfficePopover">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="openOfficePopover"
              class="h-8 justify-between min-w-50"
              :class="!localOfficeId && 'text-muted-foreground'"
            >
              <span class="truncate">
                {{
                  localOfficeId
                    ? (() => {
                        const office = allOffices.find((x) => x.office_id === localOfficeId)
                        return office
                          ? `${office.abbreviation} (${office.office_code})`
                          : 'Unknown Office'
                      })()
                    : 'Filter by office...'
                }}
              </span>
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-75 p-0">
            <Command>
              <CommandInput placeholder="Search office..." />
              <CommandEmpty>No office found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    v-for="office in allOffices"
                    :key="office.office_id"
                    :value="office.office_name"
                    @select="
                      () => {
                        localOfficeId = localOfficeId === office.office_id ? null : office.office_id
                        openOfficePopover = false
                      }
                    "
                  >
                    <Check
                      :class="
                        cn(
                          'mr-2 h-4 w-4',
                          localOfficeId === office.office_id ? 'opacity-100' : 'opacity-0',
                        )
                      "
                    />
                    {{ office.abbreviation }}
                    {{ office.office_code ? `(${office.office_code})` : '' }}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <!-- Bank Account Filter -->
        <Popover v-model:open="openBankPopover">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="openBankPopover"
              class="h-8 justify-between min-w-55"
              :class="!localBankAccountId && 'text-muted-foreground'"
            >
              {{
                localBankAccountId
                  ? (() => {
                      const acc = allAccountsWithBank.find(
                        (x) => x.bank_account_id === localBankAccountId,
                      )
                      return acc ? `${acc.bank_abbreviation} - ${acc.fund_source}` : 'Unknown Bank'
                    })()
                  : 'Filter by bank account...'
              }}
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-75 p-0">
            <Command>
              <CommandInput placeholder="Search bank account..." />
              <CommandEmpty>No bank account found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    v-for="acc in allAccountsWithBank"
                    :key="acc.bank_account_id"
                    :value="acc.account_number"
                    @select="
                      () => {
                        localBankAccountId =
                          localBankAccountId === acc.bank_account_id ? null : acc.bank_account_id
                        openBankPopover = false
                      }
                    "
                  >
                    <Check
                      :class="
                        cn(
                          'mr-2 h-4 w-4',
                          localBankAccountId === acc.bank_account_id ? 'opacity-100' : 'opacity-0',
                        )
                      "
                    />
                    {{ acc.bank_abbreviation }}-{{ acc.fund_source }}
                    <!-- {{ acc.branch_name ? `(${acc.branch_name})` : '' }} -->
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Select v-model="localStatus">
          <SelectTrigger class="h-8 w-37.5">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Added">Added</SelectItem>
          </SelectContent>
        </Select>

        <Button
          v-if="localPayrollPeriodId || localOfficeId || localBankAccountId || localStatus"
          variant="ghost"
          class="h-8 px-2 lg:px-3"
          @click="
            () => {
              localPayrollPeriodId = null
              localOfficeId = null
              localBankAccountId = null
              localStatus = null
            }
          "
        >
          Reset
          <X class="ml-2 h-4 w-4" />
        </Button>
        <ViewOptions :table="table" />
      </div>
    </div>

    <!-- Data table -->
    <div class="overflow-hidden rounded-md border">
      <Table class="min-w-xl">
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="
                cn(
                  header.column.columnDef.meta?.className,
                  header.column.columnDef.meta?.thClassName,
                )
              "
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <!-- Loading skeleton -->
          <template v-if="isLoading">
            <TableRow v-for="i in pageSize" :key="i">
              <TableCell
                v-for="col in columns"
                :key="(col as any).id ?? (col as any).accessorKey"
                class="h-12"
              >
                <div class="h-4 w-full animate-pulse rounded bg-muted" />
              </TableCell>
            </TableRow>
          </template>

          <!-- Data rows -->
          <template v-else-if="table.getRowModel().rows.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
            >
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                :class="
                  cn(cell.column.columnDef.meta?.className, cell.column.columnDef.meta?.tdClassName)
                "
              >
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>

          <!-- Empty state -->
          <TableRow v-else>
            <TableCell :colspan="columns.length" class="h-24 text-center text-muted-foreground">
              No results.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination controls -->
    <Pagination :table="table" class="mt-auto" />
  </div>
</template>
