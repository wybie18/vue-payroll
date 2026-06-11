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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { formatDate } from '@/helpers/date.helper'
import DatePicker from '@/components/ui/custom/DatePicker.vue'
import { today, getLocalTimeZone } from '@internationalized/date'

const todayString = () => today(getLocalTimeZone()).toString()

import type { PayrollAda, PayrollAdaWithDetails } from '@/types/payroll-ada.types'
import {
  validatePayrollAdaForm,
  type PayrollAdaFormErrors,
} from '@/validators/payroll-ada.validators'

import { useBankAccounts } from '@/composables/banks/useBankAccounts'
import { usePayrollPeriods } from '@/composables/payroll/usePayrollPeriods'

const props = defineProps<{
  open: boolean
  row: PayrollAdaWithDetails | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [
    data: {
      payroll_period_id: number
      bank_account_id: number
      ada_date: string
      status: string
      compensation_type: PayrollAda['compensation_type']
    },
  ]
}>()

const { allAccountsWithBank, fetchAllAccountsWithBank } = useBankAccounts()
const { payrollPeriods, fetchPayrollPeriods } = usePayrollPeriods()

const form = ref({
  payroll_period_id: null as number | null,
  bank_account_id: null as number | null,
  ada_date: '',
  status: 'Prepared',
  compensation_type: '',
})

const errors = ref<PayrollAdaFormErrors>({
  payroll_period_id: '',
  bank_account_id: '',
  ada_date: '',
  status: '',
  compensation_type: '',
})

const compensationTypeOpen = ref(false)
const compensationTypes = [
  { value: 'allowance', label: 'Allowance' },
  { value: 'salary', label: 'Salary' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'honorarium', label: 'Honorarium' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'refund', label: 'Refund' },
  { value: 'wages', label: 'Wages' },
]

const isEdit = ref(false)

const openPeriodPopover = ref(false)
const openBankPopover = ref(false)

watch([() => props.open, () => props.row], ([isOpen]) => {
  if (isOpen) {
    Promise.all([fetchAllAccountsWithBank(), fetchPayrollPeriods()])
    if (props.row) {
      isEdit.value = true
      form.value = {
        payroll_period_id: props.row.payroll_period_id,
        bank_account_id: props.row.bank_account_id,
        ada_date: props.row.ada_date,
        status: props.row.status,
        compensation_type: props.row.compensation_type || '',
      }
    } else {
      isEdit.value = false
      form.value = {
        payroll_period_id: null,
        bank_account_id: null,
        ada_date: todayString(),
        status: 'Prepared',
        compensation_type: '',
      }
    }
    errors.value = {
      payroll_period_id: '',
      bank_account_id: '',
      ada_date: '',
      status: '',
      compensation_type: '',
    }
  }
})

const handleSubmit = () => {
  const validation = validatePayrollAdaForm(
    form.value.payroll_period_id,
    form.value.bank_account_id,
    form.value.ada_date,
    form.value.status,
    form.value.compensation_type,
  )
  if (!validation.valid) {
    errors.value = validation.errors
    return
  }

  emit('submit', {
    payroll_period_id: form.value.payroll_period_id!,
    bank_account_id: form.value.bank_account_id!,
    ada_date: form.value.ada_date,
    status: form.value.status,
    compensation_type: form.value.compensation_type as PayrollAda['compensation_type'],
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
        <SheetTitle>{{ isEdit ? 'Edit Payroll ADA' : 'Add Payroll ADA' }}</SheetTitle>
        <SheetDescription>
          {{
            isEdit
              ? 'Update the details of the payroll ADA.'
              : 'Fill in the details to add a new payroll ADA.'
          }}
        </SheetDescription>
      </SheetHeader>
      <div class="grid gap-y-6 overflow-y-auto px-4 py-2">
        <!-- ADA Date -->
        <div class="grid gap-2">
          <Label for="ada_date">ADA Date <span class="text-destructive">*</span></Label>
          <DatePicker
            id="ada_date"
            v-model="form.ada_date"
            class="w-full"
            placeholder="Pick ADA Date"
          />
          <span v-if="errors.ada_date" class="text-sm text-destructive">{{ errors.ada_date }}</span>
        </div>

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
              >
                <span class="truncate">
                  {{
                    form.payroll_period_id
                      ? (() => {
                          const p = payrollPeriods.find(
                            (x) => x.payroll_period_id === form.payroll_period_id,
                          )
                          return p
                            ? `${formatDate(p.cutoff_start)} - ${formatDate(p.cutoff_end)}`
                            : 'Unknown Period'
                        })()
                      : 'Select payroll period...'
                  }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="p-0">
              <Command>
                <CommandInput placeholder="Search period..." />
                <CommandEmpty>No period found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      v-for="period in payrollPeriods"
                      :key="period.payroll_period_id"
                      :value="period.payroll_period_id.toString()"
                      @select="
                        () => {
                          form.payroll_period_id = period.payroll_period_id
                          openPeriodPopover = false
                        }
                      "
                    >
                      <Check
                        :class="
                          cn(
                            'mr-2 h-4 w-4',
                            form.payroll_period_id === period.payroll_period_id
                              ? 'opacity-100'
                              : 'opacity-0',
                          )
                        "
                      />
                      {{ formatDate(period.cutoff_start) }} - {{ formatDate(period.cutoff_end) }}
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

        <!-- Bank Account -->
        <div class="grid gap-2">
          <Label>Bank Account <span class="text-destructive">*</span></Label>
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
          <span v-if="errors.bank_account_id" class="text-sm text-destructive">{{
            errors.bank_account_id
          }}</span>
        </div>

        <!-- Compensation Type -->
        <div class="grid gap-2">
          <Label for="compensation-type"
            >Compensation Type <span class="text-destructive">*</span></Label
          >
          <Popover v-model:open="compensationTypeOpen">
            <PopoverTrigger as-child>
              <Button
                id="compensation-type"
                variant="outline"
                role="combobox"
                :aria-expanded="compensationTypeOpen"
                class="w-full justify-between"
                :class="!form.compensation_type && 'text-muted-foreground'"
              >
                {{
                  form.compensation_type
                    ? compensationTypes.find((t) => t.value === form.compensation_type)?.label ||
                      'Select type...'
                    : 'Select compensation type...'
                }}
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-100 p-0">
              <Command>
                <CommandInput placeholder="Search compensation type..." />
                <CommandEmpty>No compensation type found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      v-for="typeOption in compensationTypes"
                      :key="typeOption.value"
                      :value="typeOption.label"
                      @select="
                        () => {
                          form.compensation_type =
                            form.compensation_type === typeOption.value ? '' : typeOption.value
                          compensationTypeOpen = false
                        }
                      "
                    >
                      <Check
                        :class="
                          cn(
                            'mr-2 h-4 w-4',
                            form.compensation_type === typeOption.value
                              ? 'opacity-100'
                              : 'opacity-0',
                          )
                        "
                      />
                      {{ typeOption.label }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <span v-if="errors.compensation_type" class="text-sm text-destructive">{{
            errors.compensation_type
          }}</span>
        </div>

        <!-- Status -->
        <div class="grid gap-2">
          <Label for="status">Status <span class="text-destructive">*</span></Label>
          <Select v-model="form.status">
            <SelectTrigger>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Prepared">Prepared</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <span v-if="errors.status" class="text-sm text-destructive">{{ errors.status }}</span>
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
