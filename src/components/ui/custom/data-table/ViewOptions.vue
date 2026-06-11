<script setup lang="ts" generic="TData">
import { computed } from 'vue'
import { SlidersHorizontal } from '@lucide/vue'
import type { Table } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  table: Table<TData>
}

const props = defineProps<Props>()

const columns = computed(() =>
  props.table
    .getAllColumns()
    .filter((col) => typeof col.accessorFn !== 'undefined' && col.getCanHide()),
)

const formatColumnId = (id: string) => id.replace(/_/g, ' ')
</script>

<template>
  <DropdownMenu :modal="false">
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm" class="ms-auto hidden h-8 lg:flex">
        <SlidersHorizontal class="size-4" />
        View
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-37.5">
      <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem
        v-for="column in columns"
        :key="column.id"
        class="capitalize"
        :model-value="props.table.getColumn(column.id)?.getIsVisible() ?? true"
        @update:model-value="(value: boolean) => column.toggleVisibility(!!value)"
      >
        {{ formatColumnId(column.id) }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
