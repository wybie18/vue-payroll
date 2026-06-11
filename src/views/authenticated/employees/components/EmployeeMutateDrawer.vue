<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Check, ChevronsUpDown } from '@lucide/vue'

import { cn } from '@/lib/utils'
import type { Employee } from '@/types/employee.types'
import { validateEmployeeForm } from '@/validators/employee.validators'
import { useOffices } from '@/composables/offices/useOffices'
import { useBankAccounts } from '@/composables/banks/useBankAccounts'

// ─── Props & Emits ────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  row?: Employee | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [
    data: {
      name: string
      office_id: number
      bank_account_id: number
      account_no: string
      status: string
      employee_no: string
      eenggas_no: string
      employment_status: string
    },
  ]
}>()

// ─── Dependencies ─────────────────────────────────────────────────────────────
const { allOffices, fetchAllOffices } = useOffices()
const { allAccountsWithBank, fetchAllAccountsWithBank } = useBankAccounts()

// ─── Form state ───────────────────────────────────────────────────────────────
const name = ref('')
const officeId = ref('')
const bankAccountId = ref('')
const accountNo = ref('')
const employeeNo = ref('')
const eenggasNo = ref('')
const employmentStatus = ref('')
const status = ref(true)

const officeOpen = ref(false)
const bankAccountOpen = ref(false)
const employmentStatusOpen = ref(false)

const employmentStatuses = [
  'Permanent',
  'Temporary',
  'Coterminous',
  'Elected',
  'Casual',
  'Job Order',
  'Contract of Service',
  'Consultant',
  'Detailed',
  'Probationary',
  'Appointed',
]

const errors = ref({
  name: '',
  office_id: '',
  bank_account_id: '',
  account_no: '',
  employee_no: '',
  eenggas_no: '',
  status: '',
  employment_status: '',
})

const isEdit = computed(() => !!props.row)
const drawerTitle = computed(() => (isEdit.value ? 'Update Employee' : 'Create Employee'))
const drawerDescription = computed(() =>
  isEdit.value
    ? "Update the employee by providing necessary info. Click save when you're done."
    : "Add a new employee by providing necessary info. Click save when you're done.",
)

// ─── Sync form fields when the target row changes ─────────────────────────────

watch(
  [() => props.open, () => props.row],
  async ([isOpen, val]) => {
    if (isOpen) {
      // Fetch dropdown options. Ideally with a larger pageSize if there are many.
      await fetchAllOffices()
      await fetchAllAccountsWithBank()
      if (val) {
        name.value = val.name ?? ''
        officeId.value = val.office_id?.toString() ?? ''
        bankAccountId.value = val.bank_account_id?.toString() ?? ''
        accountNo.value = val.account_no ?? ''
        employeeNo.value = val.employee_no ?? ''
        eenggasNo.value = val.eenggas_no ?? ''
        employmentStatus.value = val.employment_status ?? ''
        status.value = val.status === 'active'
      } else {
        name.value = ''
        officeId.value = ''
        bankAccountId.value = ''
        accountNo.value = ''
        employeeNo.value = ''
        eenggasNo.value = ''
        employmentStatus.value = ''
        status.value = true
      }
      resetErrors()
    }
  },
  { immediate: true },
)

function resetErrors() {
  errors.value = {
    name: '',
    office_id: '',
    bank_account_id: '',
    account_no: '',
    employee_no: '',
    eenggas_no: '',
    status: '',
    employment_status: '',
  }
}

function handleSubmit() {
  const selectedOfficeId = officeId.value ? parseInt(officeId.value) : null
  const selectedBankAccountId = bankAccountId.value ? parseInt(bankAccountId.value) : null

  const result = validateEmployeeForm(
    name.value,
    selectedOfficeId,
    selectedBankAccountId,
    accountNo.value,
    employeeNo.value,
    eenggasNo.value,
    status.value ? 'active' : 'inactive',
    employmentStatus.value,
  )
  errors.value = result.errors

  if (!result.valid || !selectedOfficeId || !selectedBankAccountId) return

  emit('submit', {
    name: name.value.trim(),
    office_id: selectedOfficeId,
    bank_account_id: selectedBankAccountId,
    account_no: accountNo.value.trim(),
    employee_no: employeeNo.value.trim(),
    eenggas_no: eenggasNo.value.trim(),
    status: status.value ? 'active' : 'inactive',
    employment_status: employmentStatus.value,
  })
  close()
}

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Sheet :open="props.open" @update:open="close">
    <SheetContent class="flex flex-col w-full sm:max-w-md overflow-hidden">
      <SheetHeader class="text-start">
        <SheetTitle>{{ drawerTitle }}</SheetTitle>
        <SheetDescription>{{ drawerDescription }}</SheetDescription>
      </SheetHeader>

      <!-- Form -->
      <div class="flex-1 space-y-4 overflow-y-auto px-4 py-2">
        <!-- Name -->
        <div class="flex flex-col gap-2">
          <Label for="emp-name">Name</Label>
          <Input id="emp-name" v-model="name" placeholder="Enter full name" />
          <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
        </div>

        <!-- Employee No -->
        <div class="flex flex-col gap-2">
          <Label for="emp-no">Employee No</Label>
          <Input id="emp-no" v-model="employeeNo" placeholder="Enter employee number" />
          <p v-if="errors.employee_no" class="text-sm text-destructive">{{ errors.employee_no }}</p>
        </div>

        <!-- EENGGAS No -->
        <div class="flex flex-col gap-2">
          <Label for="eenggas-no">EENGGAS No</Label>
          <Input id="eenggas-no" v-model="eenggasNo" placeholder="Enter EENGGAS number" />
          <p v-if="errors.eenggas_no" class="text-sm text-destructive">{{ errors.eenggas_no }}</p>
        </div>

        <!-- Account No -->
        <div class="flex flex-col gap-2">
          <Label for="account-no">Account No</Label>
          <Input id="account-no" v-model="accountNo" placeholder="Enter account number" />
          <p v-if="errors.account_no" class="text-sm text-destructive">{{ errors.account_no }}</p>
        </div>

        <!-- Employment Status -->
        <div class="flex flex-col gap-2">
          <Label for="employment-status"
            >Employment Status <span class="text-destructive">*</span></Label
          >
          <Popover v-model:open="employmentStatusOpen">
            <PopoverTrigger as-child>
              <Button
                id="employment-status"
                variant="outline"
                role="combobox"
                :aria-expanded="employmentStatusOpen"
                class="w-full justify-between"
                :class="!employmentStatus && 'text-muted-foreground'"
              >
                <span class="truncate">
                  {{
                    employmentStatus
                      ? employmentStatuses.find((s) => s === employmentStatus) || 'Select status...'
                      : 'Select employment status...'
                  }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="p-0">
              <Command>
                <CommandInput placeholder="Search employment status..." />
                <CommandEmpty>No status found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      v-for="statusOption in employmentStatuses"
                      :key="statusOption"
                      :value="statusOption"
                      @select="
                        () => {
                          employmentStatus = employmentStatus === statusOption ? '' : statusOption
                          employmentStatusOpen = false
                        }
                      "
                    >
                      <Check
                        :class="
                          cn(
                            'mr-2 h-4 w-4',
                            employmentStatus === statusOption ? 'opacity-100' : 'opacity-0',
                          )
                        "
                      />
                      {{ statusOption }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p v-if="errors.employment_status" class="text-sm text-destructive">
            {{ errors.employment_status }}
          </p>
        </div>

        <!-- Office Select -->
        <div class="flex flex-col gap-2">
          <Label for="office-id">Office</Label>
          <Popover v-model:open="officeOpen">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                :aria-expanded="officeOpen"
                class="w-full justify-between"
                :class="!officeId && 'text-muted-foreground'"
              >
                <span class="truncate">
                  {{
                    officeId
                      ? (() => {
                          const acc = allOffices.find((a) => a.office_id.toString() === officeId)
                          return acc
                            ? `${acc.abbreviation} ${acc.office_code ? `(${acc.office_code})` : ''}`
                            : ''
                        })()
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
                          officeId =
                            officeId === office.office_id.toString()
                              ? ''
                              : office.office_id.toString()
                          officeOpen = false
                        }
                      "
                    >
                      <Check
                        :class="
                          cn(
                            'mr-2 h-4 w-4',
                            officeId === office.office_id.toString() ? 'opacity-100' : 'opacity-0',
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
          <p v-if="errors.office_id" class="text-sm text-destructive">{{ errors.office_id }}</p>
        </div>

        <!-- Bank Account Select -->
        <div class="flex flex-col gap-2">
          <Label for="bank-acc-id">Bank Account</Label>
          <Popover v-model:open="bankAccountOpen">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                :aria-expanded="bankAccountOpen"
                class="w-full justify-between"
                :class="!bankAccountId && 'text-muted-foreground'"
              >
                <span class="truncate">
                  {{
                    bankAccountId
                      ? (() => {
                          const acc = allAccountsWithBank.find(
                            (a) => a.bank_account_id.toString() === bankAccountId,
                          )
                          return acc ? `${acc.bank_abbreviation} - ${acc.fund_source}` : ''
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
                          bankAccountId =
                            bankAccountId === acc.bank_account_id.toString()
                              ? ''
                              : acc.bank_account_id.toString()
                          bankAccountOpen = false
                        }
                      "
                    >
                      <Check
                        :class="
                          cn(
                            'mr-2 h-4 w-4',
                            bankAccountId === acc.bank_account_id.toString()
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
          <p v-if="errors.bank_account_id" class="text-sm text-destructive">
            {{ errors.bank_account_id }}
          </p>
        </div>

        <!-- Status -->
        <div class="flex flex-row items-center justify-between rounded-lg border p-4">
          <div class="space-y-0.5">
            <Label for="status" class="text-base">Active Status</Label>
            <p class="text-sm text-muted-foreground">
              Determines if the employee is currently active.
            </p>
          </div>
          <Switch id="status" v-model="status" />
          <p v-if="errors.status" class="text-sm text-destructive">{{ errors.status }}</p>
        </div>
      </div>

      <SheetFooter class="gap-2">
        <SheetClose as-child>
          <Button variant="outline" @click="close">Close</Button>
        </SheetClose>
        <Button @click="handleSubmit">Save changes</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
