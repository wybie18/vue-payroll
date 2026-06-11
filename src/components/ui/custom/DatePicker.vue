<script setup lang="ts">
import { computed } from 'vue'
import { parseDate, today, getLocalTimeZone, DateFormatter, type DateValue } from '@internationalized/date'
import { CalendarIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const props = defineProps<{
  modelValue?: string | null
  placeholder?: string
  class?: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const defaultPlaceholder = today(getLocalTimeZone())
const df = new DateFormatter('en-US', { dateStyle: 'medium' })

const internalDate = computed({
  get: () => {
    try {
      return props.modelValue ? parseDate(props.modelValue) : undefined
    } catch {
      return undefined
    }
  },
  set: (val: DateValue | undefined) => {
    if (val) {
      emit('update:modelValue', val.toString())
    } else {
      emit('update:modelValue', null)
    }
  }
})
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="cn(
          'w-[280px] justify-start text-left font-normal',
          !internalDate && 'text-muted-foreground',
          props.class
        )"
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        {{ internalDate ? df.format(internalDate.toDate(getLocalTimeZone())) : (props.placeholder || "Pick a date") }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <Calendar
        v-model="internalDate"
        :initial-focus="true"
        :default-placeholder="defaultPlaceholder"
        layout="month-and-year"
      />
    </PopoverContent>
  </Popover>
</template>
