<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Loader2 } from '@lucide/vue'
import { getPayrollBatchesWithNoAda } from '@/services/payroll-batch.service'
import type { PayrollBatchWithRelations } from '@/types/payroll-batch.types'
import CompensationBadge from '@/components/ui/custom/CompensationBadge.vue'
import { COMPENSATION_LABELS } from '@/helpers/constants'

const props = defineProps<{
  open: boolean
  bankAccountId: number
  payrollPeriodId: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [batchIds: number[]]
}>()

const allBatches = ref<PayrollBatchWithRelations[]>([])
const isLoadingBatches = ref(false)

const selectedBatchIds = ref<number[]>([])
const errorText = ref('')

const fetchUnassignedBatches = async () => {
  isLoadingBatches.value = true
  const { data, error } = await getPayrollBatchesWithNoAda(props.bankAccountId, props.payrollPeriodId)
  if (!error && data) {
    allBatches.value = data
  }
  isLoadingBatches.value = false
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      selectedBatchIds.value = []
      errorText.value = ''
      fetchUnassignedBatches()
    }
  },
  { immediate: true },
)

const toggleSelectAll = () => {
  if (selectedBatchIds.value.length === allBatches.value.length) {
    selectedBatchIds.value = []
  } else {
    selectedBatchIds.value = allBatches.value.map((b) => b.batch_id)
  }
}

const toggleSelect = (id: number) => {
  const idx = selectedBatchIds.value.indexOf(id)
  if (idx > -1) {
    selectedBatchIds.value.splice(idx, 1)
  } else {
    selectedBatchIds.value.push(id)
  }
}

const isAllSelected = () => {
  return allBatches.value.length > 0 && selectedBatchIds.value.length === allBatches.value.length
}

const isSomeSelected = () => {
  return (
    selectedBatchIds.value.length > 0 && selectedBatchIds.value.length < allBatches.value.length
  )
}

const handleSubmit = () => {
  if (selectedBatchIds.value.length === 0) {
    errorText.value = 'Please select at least one payroll batch to link.'
    return
  }

  emit('submit', selectedBatchIds.value)
  emit('update:open', false)
}
</script>

<template>
  <Sheet
    :open="open"
    @update:open="
      (val) => {
        emit('update:open', val)
      }
    "
  >
    <SheetContent class="flex flex-col w-full sm:max-w-2xl overflow-hidden">
      <SheetHeader class="text-start">
        <SheetTitle>Add Payroll Batches</SheetTitle>
        <SheetDescription>
          Select one or more unassigned payroll batches to associate with this ADA.
        </SheetDescription>
      </SheetHeader>

      <!-- Content Section -->
      <div class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <div v-if="isLoadingBatches" class="flex flex-1 items-center justify-center py-12">
          <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
        </div>

        <template v-else>
          <div
            v-if="allBatches.length === 0"
            class="flex flex-1 flex-col items-center justify-center py-12 border border-dashed rounded-lg"
          >
            <p class="text-sm text-muted-foreground">No unassigned payroll batches found.</p>
            <p class="text-xs text-muted-foreground/60 mt-1">
              All batches for this bank account are already linked.
            </p>
          </div>

          <div v-else class="border rounded-md overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b bg-muted/50 text-xs font-medium text-muted-foreground">
                  <th class="p-3 text-center w-12.5">
                    <input
                      type="checkbox"
                      :checked="isAllSelected()"
                      :indeterminate="isSomeSelected()"
                      @change="toggleSelectAll"
                      class="rounded border-slate-350 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th class="p-3 text-start">Batch Code</th>
                  <th class="p-3 text-start w-50">Type</th>
                  <th class="p-3 text-start">Description</th>
                  <th class="p-3 text-center w-25">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="batch in allBatches"
                  :key="batch.batch_id"
                  class="border-b transition-colors hover:bg-muted/40 cursor-pointer"
                  @click="toggleSelect(batch.batch_id)"
                >
                  <td class="p-3 text-center" @click.stop>
                    <input
                      type="checkbox"
                      :checked="selectedBatchIds.includes(batch.batch_id)"
                      @change="toggleSelect(batch.batch_id)"
                      class="rounded border-slate-350 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                  </td>
                  <td class="p-3 w-40 font-semibold">{{ batch.batch_code }}</td>
                  <td class="p-3 max-w-10">
                    <CompensationBadge
                      :type="batch.compensation_type"
                      variant="secondary"
                      class="ml-2"
                    />
                  </td>
                  <td
                    class="p-3 text-muted-foreground truncate max-w-50"
                    :title="batch.description || ''"
                  >
                    {{ batch.description || '-' }}
                  </td>
                  <td class="p-3 text-center">
                    <span
                      class="px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="
                        batch.status === 'Draft'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-emerald-100 text-emerald-800'
                      "
                    >
                      {{ batch.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <span v-if="errorText" class="text-sm text-destructive">{{ errorText }}</span>
      </div>

      <SheetFooter class="border-t pt-4 gap-2">
        <SheetClose as-child>
          <Button variant="outline" @click="emit('update:open', false)">Cancel</Button>
        </SheetClose>
        <Button @click="handleSubmit" :disabled="selectedBatchIds.length === 0">
          Link Batches ({{ selectedBatchIds.length }})
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
