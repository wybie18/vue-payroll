<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
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

import PayrollPeriodSelect from '@/components/ui/custom/PayrollPeriodSelect.vue'
import { useOffices } from '@/composables/offices/useOffices'
import { useBankAccounts } from '@/composables/banks/useBankAccounts'
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

onMounted(async () => {
  await Promise.all([
    fetchAllOffices(),
    fetchAllAccountsWithBank(),
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

const openOfficePopover = ref(false)
const openBankPopover = ref(false)

const isEdit = computed(() => !!props.row)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.row) {
        form.value = {
          payroll_period_id: props.row.payroll_period_id,
          office_id: props.row.office_id,
          bank_account_id: props.row.bank_account_id,
        }
      } else {
        form.value = {
          payroll_period_id: null,
          office_id: null,
          bank_account_id: null,
        }
      }
      errors.value = {
        payroll_period_id: '',
      }
    }
  },
  { immediate: true },
)

function handleSubmit() {
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
  close()
}

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Sheet :open="props.open" @update:open="close">
    <SheetContent class="flex flex-col sm:max-w-md overflow-hidden">
      <SheetHeader class="text-start">
        <SheetTitle>{{ isEdit ? 'Update Payroll Batch' : 'Create Payroll Batch' }}</SheetTitle>
        <SheetDescription>
          {{
            isEdit
              ? 'Update the payroll batch details.'
              : 'Fill in the details to add a new payroll batch.'
          }}
        </SheetDescription>
      </SheetHeader>
      <div class="grid gap-y-6 overflow-y-auto px-4 py-2">
        <!-- Payroll Period -->
        <div class="grid gap-2">
          <Label>Payroll Period <span class="text-destructive">*</span></Label>
          <PayrollPeriodSelect
            v-model="form.payroll_period_id"
            placeholder="Select payroll period..."
            trigger-class="w-full"
            :clearable="false"
          />
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
