<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
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
import { formatDateRange } from '@/helpers/date.helper'

import type { PayrollBatchWithRelations } from '@/types/payroll-batch.types'
import {
  validatePayrollBatchForm,
  type PayrollBatchFormErrors,
} from '@/validators/payroll-batch.validators'

import { useOffices } from '@/composables/offices/useOffices'
import { useBankAccounts } from '@/composables/banks/useBankAccounts'
import { usePayrollPeriods } from '@/composables/payroll/usePayrollPeriods'
import { COMPENSATION_LABELS } from '@/helpers/constants'

function formatCompensationType(type?: string | null): string {
  if (!type) return ''
  return COMPENSATION_LABELS[type] || type
}

const props = defineProps<{
  open: boolean
  row: PayrollBatchWithRelations | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [
    data: {
      payroll_period_id: number
      office_id: number | null
      bank_account_id: number | null
    },
  ]
}>()

const { allOffices, fetchAllOffices } = useOffices()
const { allAccountsWithBank, fetchAllAccountsWithBank } = useBankAccounts()
const { payrollPeriods, fetchPayrollPeriods } = usePayrollPeriods()

onMounted(async () => {
  await Promise.all([
    fetchAllOffices(),
    fetchAllAccountsWithBank(),
    // We fetch a list of recent payroll periods to pick from
    fetchPayrollPeriods(),
  ])
})

const form = ref({
  payroll_period_id: null as number | null,
  office_id: null as number | null,
  bank_account_id: null as number | null,
})

const errors = ref<PayrollBatchFormErrors>({
  payroll_period_id: '',
})

const isEdit = ref(false)

const openPeriodPopover = ref(false)
const openOfficePopover = ref(false)
const openBankPopover = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.row) {
        isEdit.value = true
        form.value = {
          payroll_period_id: props.row.payroll_period_id,
          office_id: props.row.office_id,
          bank_account_id: props.row.bank_account_id,
        }
      } else {
        isEdit.value = false
        form.value = {
          payroll_period_id: null,
          office_id: null,
          bank_account_id: null,
        }
      }
      errors.value = { payroll_period_id: '' }
    }
  },
)

const handleSubmit = () => {
  const validation = validatePayrollBatchForm(form.value.payroll_period_id)
  if (!validation.valid) {
    errors.value = validation.errors
    return
  }

  emit('submit', {
    payroll_period_id: form.value.payroll_period_id!,
    office_id: form.value.office_id,
    bank_account_id: form.value.bank_account_id,
  })
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
    <SheetContent class="flex flex-col">
      <SheetHeader>
        <SheetTitle>{{ isEdit ? 'Edit Payroll Batch' : 'Add Payroll Batch' }}</SheetTitle>
        <SheetDescription>
          {{
            isEdit
              ? 'Update the details of the payroll batch.'
              : 'Fill in the details to add a new payroll batch.'
          }}
        </SheetDescription>
      </SheetHeader>
      <div class="grid gap-y-6 overflow-y-auto px-4 py-2">
        <!-- Payroll Period -->
        <div class="grid gap-2">
          <Label>Payroll Period <span class="text-destructive">*</span></Label>
          <Popover v-model:open="openPeriodPopover">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                :aria-expanded="openPeriodPopover"
                class="w-full justify-between"
                :class="!form.payroll_period_id && 'text-muted-foreground'"
                :title="
                  form.payroll_period_id
                    ? (payrollPeriods.find((x) => x.payroll_period_id === form.payroll_period_id)
                        ?.description ?? 'No description')
                    : undefined
                "
              >
                <span class="truncate">
                  {{
                    form.payroll_period_id
                      ? (() => {
                          const p = payrollPeriods.find(
                            (x) => x.payroll_period_id === form.payroll_period_id,
                          )
                          if (!p) return 'Unknown Period'
                          const range = formatDateRange(p.cutoff_start, p.cutoff_end)
                          const compType = formatCompensationType(p.compensation_type)
                          return compType ? `${range} (${compType})` : range
                        })()
                      : 'Select payroll period...'
                  }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-80 p-0">
              <Command>
                <CommandInput placeholder="Search period..." />
                <CommandEmpty>No period found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      v-for="period in payrollPeriods"
                      :key="period.payroll_period_id"
                      :value="`${formatDateRange(period.cutoff_start, period.cutoff_end)} ${formatCompensationType(period.compensation_type)} ${period.description || ''}`"
                      :title="period.description || 'No description'"
                      class="flex items-center justify-between py-2"
                      @select="
                        () => {
                          form.payroll_period_id = period.payroll_period_id
                          openPeriodPopover = false
                        }
                      "
                    >
                      <div class="flex items-center gap-2 overflow-hidden">
                        <Check
                          :class="
                            cn(
                              'h-4 w-4 shrink-0',
                              form.payroll_period_id === period.payroll_period_id
                                ? 'opacity-100'
                                : 'opacity-0',
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
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <span v-if="errors.payroll_period_id" class="text-sm text-destructive">{{
            errors.payroll_period_id
          }}</span>
        </div>

        <!-- Office -->
        <div class="grid gap-2">
          <Label>Office</Label>
          <Popover v-model:open="openOfficePopover">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                :aria-expanded="openOfficePopover"
                class="w-full justify-between"
                :class="!form.office_id && 'text-muted-foreground'"
              >
                <span class="truncate">
                  {{
                    form.office_id
                      ? allOffices.find((x) => x.office_id === form.office_id)?.abbreviation
                      : 'Select office...'
                  }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="p-0">
              <Command>
                <CommandInput placeholder="Search office..." />
                <CommandEmpty>No office found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      v-for="office in allOffices"
                      :key="office.office_id"
                      :value="office.office_name"
                      @select="
                        () => {
                          form.office_id = office.office_id
                          openOfficePopover = false
                        }
                      "
                    >
                      <Check
                        :class="
                          cn(
                            'mr-2 h-4 w-4',
                            form.office_id === office.office_id ? 'opacity-100' : 'opacity-0',
                          )
                        "
                      />
                      {{ office.abbreviation }}
                      {{ office.office_code ? `(${office.office_code})` : '' }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <!-- Bank Account -->
        <div class="grid gap-2">
          <Label>Bank Account</Label>
          <Popover v-model:open="openBankPopover">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                :aria-expanded="openBankPopover"
                class="w-full justify-between"
                :class="!form.bank_account_id && 'text-muted-foreground'"
              >
                <span class="truncate">
                  {{
                    form.bank_account_id
                      ? (() => {
                          const acc = allAccountsWithBank.find(
                            (x) => x.bank_account_id === form.bank_account_id,
                          )
                          return acc ? `${acc.bank_abbreviation} - ${acc.fund_source}` : 'Unknown'
                        })()
                      : 'Select bank account...'
                  }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="p-0">
              <Command>
                <CommandInput placeholder="Search bank account..." />
                <CommandEmpty>No bank account found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      v-for="acc in allAccountsWithBank"
                      :key="acc.bank_account_id"
                      :value="acc.account_number"
                      @select="
                        () => {
                          form.bank_account_id = acc.bank_account_id
                          openBankPopover = false
                        }
                      "
                    >
                      <Check
                        :class="
                          cn(
                            'mr-2 h-4 w-4',
                            form.bank_account_id === acc.bank_account_id
                              ? 'opacity-100'
                              : 'opacity-0',
                          )
                        "
                      />
                      {{ acc.bank_abbreviation }} - {{ acc.fund_source }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <SheetFooter class="gap-2">
        <SheetClose as-child>
          <Button variant="outline" @click="emit('update:open', false)">Cancel</Button>
        </SheetClose>
        <Button @click="handleSubmit">Save changes</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
