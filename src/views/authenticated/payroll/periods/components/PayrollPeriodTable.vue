<script setup lang="ts" generic="TData">
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  FlexRender,
  getCoreRowModel,
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
import { X } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import Pagination from '@/components/ui/custom/data-table/Pagination.vue'
import ViewOptions from '@/components/ui/custom/data-table/ViewOptions.vue'
import DatePicker from '@/components/ui/custom/DatePicker.vue'

// ─── Props & Emits ────────────────────────────────────────────────────────────

interface Props {
  data: TData[]
  columns: ColumnDef<TData>[]
  isLoading?: boolean
  totalCount?: number
  pageSize?: number
  page?: number
  startDate?: string | null
  endDate?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  totalCount: 0,
  pageSize: 10,
  page: 1,
  startDate: null,
  endDate: null,
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:page-size': [pageSize: number]
  'update:start-date': [startDate: string | null]
  'update:end-date': [endDate: string | null]
  show: [row: TData]
  edit: [row: TData]
  delete: [row: TData]
}>()

const localStartDate = computed({
  get: () => props.startDate ?? null,
  set: (val) => emit('update:start-date', val),
})

const localEndDate = computed({
  get: () => props.endDate ?? null,
  set: (val) => emit('update:end-date', val),
})

// ─── UI-only table state ──────────────────────────────────────────────────────

const sorting = ref<SortingState>([])
const columnVisibility = useStorage<VisibilityState>('payroll-period-table-column-visibility', {})

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

  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),

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
        <!-- Date Filters -->
        <DatePicker v-model="localStartDate" class="w-50" placeholder="Start Date" />
        <span class="text-muted-foreground text-sm">to</span>
        <DatePicker v-model="localEndDate" class="w-50" placeholder="End Date" />

        <!-- Clear Filters -->
        <Button
          v-if="localStartDate || localEndDate"
          variant="ghost"
          class="h-8 px-2 lg:px-3"
          @click="
            () => {
              localStartDate = null
              localEndDate = null
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
