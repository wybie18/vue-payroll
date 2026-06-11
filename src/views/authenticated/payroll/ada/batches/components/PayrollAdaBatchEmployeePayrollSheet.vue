<script setup lang="ts">
import { computed } from 'vue'
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
import { useEmployeePayrolls } from '@/composables/payroll/useEmployeePayrolls'

const props = defineProps<{
  open: boolean
  batch: any | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const batchId = computed(() => props.batch?.batch_id ?? null)
const { employeePayrolls, isLoading } = useEmployeePayrolls(batchId)

const totalNetPay = computed(() => {
  return employeePayrolls.value.reduce((sum, item) => sum + Number(item.net_pay), 0)
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

function close() {
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
        <SheetTitle>Employee Payroll Details</SheetTitle>
        <SheetDescription>
          Viewing employee payroll records for batch:
          <span class="font-semibold text-foreground">{{ props.batch?.batch_code }}</span>
        </SheetDescription>
      </SheetHeader>

      <div class="px-4 flex flex-col">
        <div
          v-if="props.batch && !isLoading && employeePayrolls.length > 0"
          class="grid grid-cols-2 gap-4 rounded-lg border bg-muted/40 p-4 text-sm mt-2 shrink-0"
        >
          <div>
            <span class="text-muted-foreground block text-xs">Total Employees</span>
            <span class="font-semibold text-base">{{ employeePayrolls.length }}</span>
          </div>
          <div>
            <span class="text-muted-foreground block text-xs">Total Net Pay</span>
            <span class="font-semibold text-base text-primary">{{
              formatCurrency(totalNetPay)
            }}</span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto flex flex-col gap-4 mt-2">
          <div v-if="isLoading" class="flex flex-1 items-center justify-center py-12">
            <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
          </div>

          <template v-else>
            <div
              v-if="employeePayrolls.length === 0"
              class="flex flex-1 flex-col items-center justify-center py-12 border border-dashed rounded-lg"
            >
              <p class="text-sm text-muted-foreground">
                No employee payroll records found in this batch.
              </p>
            </div>

            <div v-else class="border rounded-md overflow-hidden">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b bg-muted/50 text-xs font-medium text-muted-foreground">
                    <th class="p-3 text-start">Employee Name</th>
                    <th class="p-3 text-center">Account No</th>
                    <th class="p-3 text-end">Net Pay</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in employeePayrolls"
                    :key="item.id"
                    class="border-b transition-colors hover:bg-muted/40"
                  >
                    <td class="p-3 font-medium">{{ item.employee?.name || 'Unknown Employee' }}</td>
                    <td class="p-3 text-center font-mono text-xs text-muted-foreground">
                      {{ item.account_no }}
                    </td>
                    <td class="p-3 text-end font-semibold">
                      {{ formatCurrency(Number(item.net_pay)) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
      <SheetFooter class="border-t pt-4 gap-2 shrink-0">
        <SheetClose as-child>
          <Button variant="outline" @click="close">Close</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
