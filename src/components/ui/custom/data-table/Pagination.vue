<script setup lang="ts" generic="TData">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@lucide/vue'
import type { Table } from '@tanstack/vue-table'
import { cn, getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  table: Table<TData>
  class?: string
}

const props = defineProps<Props>()

const currentPage = computed(() => props.table.getState().pagination.pageIndex + 1)
const totalPages = computed(() => props.table.getPageCount())
const pageNumbers = computed(() => getPageNumbers(currentPage.value, totalPages.value))
</script>

<template>
  <div
    :class="
      cn(
        'flex items-center justify-between overflow-clip px-2',
        '@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4',
        props.class,
      )
    "
    :style="{ overflowClipMargin: '1px' }"
  >
    <!-- Left: page indicator + rows per page -->
    <div class="flex w-full items-center justify-between">
      <div class="flex w-25 items-center justify-center text-sm font-medium @2xl/content:hidden">
        Page {{ currentPage }} of {{ totalPages }}
      </div>
      <div class="flex items-center gap-2 @max-2xl/content:flex-row-reverse">
        <Select
          :model-value="`${props.table.getState().pagination.pageSize}`"
          @update:model-value="(val) => props.table.setPageSize(Number(val))"
        >
          <SelectTrigger class="h-8 w-17.5">
            <SelectValue :placeholder="`${props.table.getState().pagination.pageSize}`" />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectItem
              v-for="pageSize in [10, 20, 30, 40, 50]"
              :key="pageSize"
              :value="`${pageSize}`"
            >
              {{ pageSize }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p class="hidden text-sm font-medium sm:block">Rows per page</p>
      </div>
    </div>

    <!-- Right: pagination controls -->
    <div class="flex items-center sm:space-x-6 lg:space-x-8">
      <div
        class="flex w-25 items-center justify-center text-sm font-medium @max-3xl/content:hidden"
      >
        Page {{ currentPage }} of {{ totalPages }}
      </div>
      <div class="flex items-center space-x-2">
        <!-- First page -->
        <Button
          variant="outline"
          class="size-8 p-0 @max-md/content:hidden"
          :disabled="!props.table.getCanPreviousPage()"
          @click="props.table.setPageIndex(0)"
        >
          <span class="sr-only">Go to first page</span>
          <ChevronsLeft class="h-4 w-4" />
        </Button>

        <!-- Previous page -->
        <Button
          variant="outline"
          class="size-8 p-0"
          :disabled="!props.table.getCanPreviousPage()"
          @click="props.table.previousPage()"
        >
          <span class="sr-only">Go to previous page</span>
          <ChevronLeft class="h-4 w-4" />
        </Button>

        <!-- Page number buttons -->
        <div
          v-for="(pageNumber, index) in pageNumbers"
          :key="`${pageNumber}-${index}`"
          class="flex items-center"
        >
          <span v-if="pageNumber === '...'" class="px-1 text-sm text-muted-foreground">...</span>
          <Button
            v-else
            :variant="currentPage === pageNumber ? 'default' : 'outline'"
            class="h-8 min-w-8 px-2"
            @click="props.table.setPageIndex((pageNumber as number) - 1)"
          >
            <span class="sr-only">Go to page {{ pageNumber }}</span>
            {{ pageNumber }}
          </Button>
        </div>

        <!-- Next page -->
        <Button
          variant="outline"
          class="size-8 p-0"
          :disabled="!props.table.getCanNextPage()"
          @click="props.table.nextPage()"
        >
          <span class="sr-only">Go to next page</span>
          <ChevronRight class="h-4 w-4" />
        </Button>

        <!-- Last page -->
        <Button
          variant="outline"
          class="size-8 p-0 @max-md/content:hidden"
          :disabled="!props.table.getCanNextPage()"
          @click="props.table.setPageIndex(props.table.getPageCount() - 1)"
        >
          <span class="sr-only">Go to last page</span>
          <ChevronsRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
