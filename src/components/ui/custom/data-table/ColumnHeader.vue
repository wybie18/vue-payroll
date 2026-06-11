<script setup lang="ts" generic="TData, TValue">
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from '@lucide/vue'
import type { Column } from '@tanstack/vue-table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  column: Column<any, any>
  title: string
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div v-if="!props.column.getCanSort()" :class="cn(props.class)">
    {{ props.title }}
  </div>

  <div v-else :class="cn('flex items-center space-x-2', props.class)">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="sm" class="h-8 data-[state=open]:bg-accent">
          <span>{{ props.title }}</span>
          <ArrowDown v-if="props.column.getIsSorted() === 'desc'" class="ms-2 h-4 w-4" />
          <ArrowUp v-else-if="props.column.getIsSorted() === 'asc'" class="ms-2 h-4 w-4" />
          <ChevronsUpDown v-else class="ms-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem @click="props.column.toggleSorting(false)">
          <ArrowUp class="size-3.5 text-muted-foreground/70" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem @click="props.column.toggleSorting(true)">
          <ArrowDown class="size-3.5 text-muted-foreground/70" />
          Desc
        </DropdownMenuItem>
        <template v-if="props.column.getCanHide()">
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="props.column.toggleVisibility(false)">
            <EyeOff class="size-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
