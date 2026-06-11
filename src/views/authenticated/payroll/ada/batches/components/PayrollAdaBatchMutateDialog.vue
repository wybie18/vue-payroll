<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Check, ChevronsUpDown } from '@lucide/vue'
import { cn } from '@/lib/utils'

import { getPayrollBatchesWithNoAda } from '@/services/payroll-batch.service'
import type { PayrollBatch } from '@/types/payroll-batch.types'

const props = defineProps<{
  open: boolean
  bankAccountId: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [batchId: number]
}>()

const allBatches = ref<PayrollBatch[]>([])
const isLoadingBatches = ref(false)

const selectedBatchId = ref<number | null>(null)
const errorText = ref('')
const openBatchPopover = ref(false)

const fetchUnassignedBatches = async () => {
  isLoadingBatches.value = true
  const { data, error } = await getPayrollBatchesWithNoAda(props.bankAccountId)
  if (!error && data) {
    allBatches.value = data
  }
  isLoadingBatches.value = false
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      selectedBatchId.value = null
      errorText.value = ''
      fetchUnassignedBatches()
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  if (!selectedBatchId.value) {
    errorText.value = 'Please select a payroll batch to link.'
    return
  }

  emit('submit', selectedBatchId.value)
  emit('update:open', false)
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="
      (val) => {
        emit('update:open', val)
      }
    "
  >
    <DialogContent class="sm:max-w-106.25">
      <DialogHeader>
        <DialogTitle>Add Payroll Batch</DialogTitle>
        <DialogDescription> Select a payroll batch to associate with this ADA. </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <!-- Payroll Batch -->
        <div class="grid gap-2">
          <Label for="payroll-batch" class="text-sm font-medium">
            Payroll Batch <span class="text-destructive">*</span>
          </Label>
          <Popover v-model:open="openBatchPopover">
            <PopoverTrigger as-child>
              <Button
                id="payroll-batch"
                variant="outline"
                role="combobox"
                :aria-expanded="openBatchPopover"
                class="w-full justify-between"
                :class="!selectedBatchId && 'text-muted-foreground'"
              >
                <span class="truncate">
                  {{
                    selectedBatchId
                      ? allBatches.find((x) => x.batch_id === selectedBatchId)?.batch_code ||
                        'Select batch...'
                      : 'Select batch...'
                  }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="p-0">
              <Command>
                <CommandInput placeholder="Search batch code..." />
                <CommandEmpty>No batch found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      v-for="batch in allBatches"
                      :key="batch.batch_id"
                      :value="batch.batch_code"
                      @select="
                        () => {
                          selectedBatchId = batch.batch_id
                          errorText = ''
                          openBatchPopover = false
                        }
                      "
                    >
                      <Check
                        :class="
                          cn(
                            'mr-2 h-4 w-4',
                            selectedBatchId === batch.batch_id ? 'opacity-100' : 'opacity-0',
                          )
                        "
                      />
                      {{ batch.batch_code }}
                      <span class="text-xs text-muted-foreground ml-2"> ({{ batch.status }}) </span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <span v-if="errorText" class="text-sm text-destructive mt-1">{{ errorText }}</span>
        </div>
      </div>

      <DialogFooter class="sm:justify-end gap-2">
        <Button variant="outline" @click="emit('update:open', false)">Cancel</Button>
        <Button @click="handleSubmit">Link Batch</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
