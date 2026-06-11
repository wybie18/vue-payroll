<script setup lang="ts">
import { ref } from 'vue'
import { Check, ChevronsUpDown } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Option {
  label: string
  value: string
}

const props = defineProps<{
  label: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  options: Option[]
  disabled?: boolean
}>()

const model = defineModel<string>({ default: '' })
const open = ref(false)
</script>

<template>
  <div class="flex flex-col space-y-2">
    <Label>{{ label }}</Label>
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          :disabled="disabled"
          :class="cn('w-full justify-between font-normal', !model && 'text-muted-foreground')"
        >
          <span class="truncate">{{
            model || placeholder || `Select ${label.toLowerCase()}`
          }}</span>
          <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-75 p-0" align="start">
        <Command>
          <CommandInput :placeholder="searchPlaceholder || `Search ${label.toLowerCase()}...`" />
          <CommandList>
            <CommandEmpty>{{ emptyText || `No ${label.toLowerCase()} found.` }}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                v-for="opt in options"
                :key="opt.value"
                :value="opt.label"
                @select="
                  () => {
                    model = opt.value
                    open = false
                  }
                "
              >
                <Check
                  :class="cn('mr-2 h-4 w-4', model === opt.value ? 'opacity-100' : 'opacity-0')"
                />
                {{ opt.label }}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</template>
