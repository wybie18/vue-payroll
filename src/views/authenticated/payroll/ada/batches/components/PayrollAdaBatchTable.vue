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
import Pagination from '@/components/ui/custom/data-table/Pagination.vue'
import ViewOptions from '@/components/ui/custom/data-table/ViewOptions.vue'

interface Props {
  data: TData[]
  columns: ColumnDef<TData>[]
  isLoading?: boolean
  totalCount?: number
  pageSize?: number
  page?: number
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  totalCount: 0,
  pageSize: 10,
  page: 1,
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:page-size': [pageSize: number]
  'show-employee-payroll': [row: TData]
  delete: [row: TData]
}>()

const sorting = ref<SortingState>([])
const columnVisibility = useStorage<VisibilityState>(
  'payroll-ada-batch-table-column-visibility',
  {},
)


const pageCount = computed(() =>
  props.pageSize > 0 ? Math.ceil(props.totalCount / props.pageSize) : 0,
)

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
    onShowEmployeePayroll: (row: TData) => emit('show-employee-payroll', row),
    onDelete: (row: TData) => emit('delete', row),
  },
})
</script>

<template>
  <div :class="cn('flex flex-1 flex-col gap-4')">
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center gap-2 justify-end">
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
