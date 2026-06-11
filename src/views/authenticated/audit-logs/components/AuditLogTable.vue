<script setup lang="ts" generic="TData">
import { ref, computed } from 'vue'
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
import { Input } from '@/components/ui/input'
import { Search as SearchIcon, X } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Pagination from '@/components/ui/custom/data-table/Pagination.vue'
import ViewOptions from '@/components/ui/custom/data-table/ViewOptions.vue'

// ─── Props & Emits ────────────────────────────────────────────────────────────

interface Props {
  data: TData[]
  columns: ColumnDef<TData>[]
  isLoading?: boolean
  totalCount?: number
  pageSize?: number
  page?: number
  tableName?: string | null
  action?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  totalCount: 0,
  pageSize: 10,
  page: 1,
  tableName: '',
  action: null,
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:page-size': [pageSize: number]
  'update:table-name': [tableName: string | null]
  'update:action': [action: string | null]
  show: [row: TData]
}>()

const localTableName = computed({
  get: () => props.tableName ?? '',
  set: (val) => emit('update:table-name', val || null),
})

const localAction = computed({
  get: () => props.action ?? 'all',
  set: (val) => emit('update:action', val === 'all' ? null : val),
})

// ─── UI-only table state ──────────────────────────────────────────────────────

const sorting = ref<SortingState>([])
const columnVisibility = ref<VisibilityState>({})


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
  },
})
</script>

<template>
  <div class="flex flex-1 flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex flex-wrap items-center gap-2 flex-1">
        <!-- Table Name Filter -->
        <div class="relative w-full max-w-xs">
          <SearchIcon
            class="absolute inset-y-0 left-2.5 my-auto text-muted-foreground"
            :size="16"
          />
          <Input v-model="localTableName" placeholder="Filter by table (e.g. offices)..." class="h-8 pl-8" />
        </div>

        <!-- Action Filter -->
        <Select v-model="localAction">
          <SelectTrigger class="h-8 w-36">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="INSERT">Insert</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
          </SelectContent>
        </Select>

        <!-- Clear Filters -->
        <Button
          v-if="localTableName || props.action"
          variant="ghost"
          class="h-8 px-2 lg:px-3"
          @click="
            () => {
              localTableName = ''
              localAction = 'all'
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
              No audit logs found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination controls -->
    <Pagination :table="table" class="mt-auto" />
  </div>
</template>
