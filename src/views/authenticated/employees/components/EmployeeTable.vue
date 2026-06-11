<script setup lang="ts" generic="TData">
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { Search as SearchIcon } from '@lucide/vue'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Check, ChevronsUpDown, X } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import Pagination from '@/components/ui/custom/data-table/Pagination.vue'
import ViewOptions from '@/components/ui/custom/data-table/ViewOptions.vue'
import { useOffices } from '@/composables/offices/useOffices'
import { onMounted } from 'vue'

// ─── Props & Emits ────────────────────────────────────────────────────────────

interface Props {
  data: TData[]
  columns: ColumnDef<TData>[]
  isLoading?: boolean
  totalCount?: number
  pageSize?: number
  page?: number
  search?: string
  officeId?: number | null
  status?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  totalCount: 0,
  pageSize: 10,
  page: 1,
  search: '',
  officeId: null,
  status: null,
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:page-size': [pageSize: number]
  'update:search': [search: string]
  'update:office-id': [officeId: number | null]
  'update:status': [status: string | null]
  show: [row: TData]
  edit: [row: TData]
  delete: [row: TData]
}>()

const localSearch = computed({
  get: () => props.search,
  set: (val) => emit('update:search', val),
})

const localOfficeId = computed({
  get: () => props.officeId ?? null,
  set: (val) => emit('update:office-id', val),
})

const localStatus = computed({
  get: () => props.status ?? null,
  set: (val) => emit('update:status', val),
})

const officeOpen = ref(false)

const { allOffices, fetchAllOffices } = useOffices()

onMounted(async () => {
  await fetchAllOffices()
})

// ─── UI-only table state ──────────────────────────────────────────────────────

const sorting = ref<SortingState>([])
const columnVisibility = useStorage<VisibilityState>('employee-table-column-visibility', {})
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
    onShow: (row: TData) => emit('show', row),
    onEdit: (row: TData) => emit('edit', row),
    onDelete: (row: TData) => emit('delete', row),
  },
})
</script>

<template>
  <div :class="cn('max-sm:has-[div[role=\'toolbar\']]:mb-16', 'flex flex-1 flex-col gap-4')">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex flex-wrap items-center gap-2 flex-1">
        <!-- Search -->
        <div class="relative w-full max-w-sm">
          <SearchIcon
            class="absolute inset-y-0 left-2.5 my-auto text-muted-foreground"
            :size="16"
          />
          <Input v-model="localSearch" placeholder="Search employees..." class="h-8 pl-8" />
        </div>

        <!-- Office Filter -->
        <Popover v-model:open="officeOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="officeOpen"
              class="h-8 justify-between min-w-50"
              :class="!localOfficeId && 'text-muted-foreground'"
            >
              {{
                localOfficeId
                  ? `${allOffices.find((o) => o.office_id === localOfficeId)?.office_name} ${allOffices.find((o) => o.office_id === localOfficeId)?.office_code ? `(${allOffices.find((o) => o.office_id === localOfficeId)?.office_code})` : ''}`
                  : 'Filter by office...'
              }}
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="p-0 w-75">
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
                        officeOpen = false
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
                    {{ office.office_name }}
                    {{ office.office_code ? `(${office.office_code})` : '' }}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <!-- Status Filter -->
        <Select v-model="localStatus">
          <SelectTrigger class="h-8 w-37.5">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <!-- Clear Filters -->
        <Button
          v-if="localSearch || localOfficeId || localStatus"
          variant="ghost"
          class="h-8 px-2 lg:px-3"
          @click="
            () => {
              localSearch = ''
              localOfficeId = null
              localStatus = null
            }
          "
        >
          Reset
          <X class="ml-2 h-4 w-4" />
        </Button>
      </div>

      <ViewOptions :table="table" />
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
