<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, Search } from '@lucide/vue'
import { cn } from '@/lib/utils'
import type { PayrollPeriod } from '@/types/payroll-period.types'
import { listPayrollPeriods, getPayrollPeriodById } from '@/services/payroll-period.service'
import { formatDateRange } from '@/helpers/date.helper'
import { COMPENSATION_LABELS } from '@/helpers/constants'

function formatCompensationType(type?: string | null): string {
  if (!type) return ''
  return COMPENSATION_LABELS[type] || type
}

interface Props {
  modelValue: number | null
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  triggerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select payroll period...',
  disabled: false,
  clearable: true,
  triggerClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  change: [period: PayrollPeriod | null]
}>()

const open = ref(false)
const periods = ref<PayrollPeriod[]>([])
const searchQuery = ref('')
const isLoading = ref(false)
const isLoadingMore = ref(false)
const page = ref(1)
const hasMore = ref(true)
const selectedPeriod = ref<PayrollPeriod | null>(null)

// Format label for trigger button
const selectedLabel = computed(() => {
  if (!props.modelValue) return ''
  const found = periods.value.find((p) => p.payroll_period_id === props.modelValue)
  if (found) {
    const range = formatDateRange(found.cutoff_start, found.cutoff_end)
    const compType = formatCompensationType(found.compensation_type)
    return compType ? `${range} (${compType})` : range
  }
  if (selectedPeriod.value && selectedPeriod.value.payroll_period_id === props.modelValue) {
    const range = formatDateRange(selectedPeriod.value.cutoff_start, selectedPeriod.value.cutoff_end)
    const compType = formatCompensationType(selectedPeriod.value.compensation_type)
    return compType ? `${range} (${compType})` : range
  }
  return 'Loading...'
})

// Fetch single modelValue if not present in loaded buffer
watch(
  () => props.modelValue,
  async (newId) => {
    if (newId) {
      const exists = periods.value.find((p) => p.payroll_period_id === newId)
      if (!exists) {
        const { data } = await getPayrollPeriodById(newId)
        if (data) selectedPeriod.value = data
      }
    } else {
      selectedPeriod.value = null
    }
  },
  { immediate: true },
)

// Module-scoped cache for default page 1 of payroll periods
const initialBuffer = ref<PayrollPeriod[]>([])
const initialCount = ref(0)
let isInitialLoaded = false
let initialFetchPromise: Promise<void> | null = null

function clearPayrollPeriodSelectCache() {
  initialBuffer.value = []
  initialCount.value = 0
  isInitialLoaded = false
  initialFetchPromise = null
}

async function fetchDropdownPeriods(reset = false) {
  if (reset && searchQuery.value === '') {
    if (isInitialLoaded && initialBuffer.value.length > 0) {
      periods.value = [...initialBuffer.value]
      hasMore.value = initialBuffer.value.length < initialCount.value
      page.value = 1
      isLoading.value = false
      return
    }

    if (initialFetchPromise) {
      isLoading.value = true
      await initialFetchPromise
      periods.value = [...initialBuffer.value]
      hasMore.value = initialBuffer.value.length < initialCount.value
      page.value = 1
      isLoading.value = false
      return
    }
  }

  if (reset) {
    page.value = 1
    hasMore.value = true
    periods.value = []
    isLoading.value = true
  } else {
    isLoadingMore.value = true
  }

  const isDefaultFetch = reset && searchQuery.value === '' && page.value === 1

  const fetchTask = (async () => {
    try {
      const { data, count, error } = await listPayrollPeriods({
        page: page.value,
        pageSize: 20,
        search: searchQuery.value,
      })

      if (!error) {
        if (reset) {
          periods.value = data
          if (isDefaultFetch) {
            initialBuffer.value = data
            initialCount.value = count
            isInitialLoaded = true
          }
        } else {
          periods.value = [...periods.value, ...data]
        }
        hasMore.value = periods.value.length < count
      }
    } catch (err) {
      console.error('[PayrollPeriodSelect] Error fetching periods:', err)
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  })()

  if (isDefaultFetch) {
    initialFetchPromise = fetchTask
    await initialFetchPromise
    initialFetchPromise = null
  } else {
    await fetchTask
  }
}

watchDebounced(
  searchQuery,
  () => {
    fetchDropdownPeriods(true)
  },
  { debounce: 300 },
)

function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  if (
    target.scrollHeight - target.scrollTop <= target.clientHeight + 15 &&
    !isLoading.value &&
    !isLoadingMore.value &&
    hasMore.value
  ) {
    page.value++
    fetchDropdownPeriods(false)
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    searchQuery.value = ''
    fetchDropdownPeriods(true)
  }
})

function handleSelect(period: PayrollPeriod) {
  if (props.modelValue === period.payroll_period_id && props.clearable) {
    emit('update:modelValue', null)
    emit('change', null)
  } else {
    selectedPeriod.value = period
    emit('update:modelValue', period.payroll_period_id)
    emit('change', period)
  }
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        :disabled="disabled"
        :class="cn('justify-between', !modelValue && 'text-muted-foreground', triggerClass)"
        :title="selectedPeriod?.description || undefined"
      >
        <span class="truncate">
          {{ modelValue ? selectedLabel : placeholder }}
        </span>
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-80 p-0">
      <div class="flex flex-col max-h-75 w-full overflow-hidden">
        <!-- Search input -->
        <div class="flex items-center border-b px-3 shrink-0">
          <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            v-model="searchQuery"
            class="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search period..."
          />
        </div>
        <!-- Scrollable container -->
        <div class="flex-1 overflow-y-auto p-1 max-h-65" @scroll="handleScroll">
          <div v-if="isLoading && periods.length === 0" class="py-6 text-center text-sm text-muted-foreground">
            Loading periods...
          </div>
          <div v-else-if="periods.length === 0" class="py-6 text-center text-sm text-muted-foreground">
            No period found.
          </div>
          <div v-else class="space-y-1">
            <button
              v-for="period in periods"
              :key="period.payroll_period_id"
              type="button"
              class="relative flex w-full cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left"
              :title="period.description || undefined"
              @click="handleSelect(period)"
            >
              <div class="flex items-center gap-2 overflow-hidden">
                <Check
                  :class="
                    cn(
                      'h-4 w-4 shrink-0',
                      modelValue === period.payroll_period_id ? 'opacity-100' : 'opacity-0',
                    )
                  "
                />
                <span class="font-medium truncate">
                  {{ formatDateRange(period.cutoff_start, period.cutoff_end) }}
                </span>
              </div>
              <span
                v-if="period.compensation_type"
                class="ml-2 shrink-0 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize"
              >
                {{ formatCompensationType(period.compensation_type) }}
              </span>
            </button>
            <div v-if="isLoadingMore" class="py-2 text-center text-xs text-muted-foreground">
              Loading more...
            </div>
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
