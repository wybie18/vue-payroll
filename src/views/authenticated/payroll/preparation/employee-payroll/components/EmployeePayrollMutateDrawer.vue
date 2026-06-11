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
import { Input } from '@/components/ui/input'
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

import type { EmployeePayrollWithEmployee } from '@/types/employee-payroll.types'
import {
  validateEmployeePayrollForm,
  type EmployeePayrollFormErrors,
} from '@/validators/employee-payroll.validators'

import { useEmployees } from '@/composables/employees/useEmployees'

const props = defineProps<{
  open: boolean
  row: EmployeePayrollWithEmployee | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [
    data: {
      employee_id: number
      account_no: string
      net_pay: number
      bank_account_id: number | null
    },
  ]
}>()

const { allEmployees, fetchAllEmployees } = useEmployees()

onMounted(async () => {
  await fetchAllEmployees()
})

const form = ref({
  employee_id: null as number | null,
  account_no: '',
  net_pay: '' as string | number,
  bank_account_id: null as number | null,
})

const errors = ref<EmployeePayrollFormErrors>({
  employee_id: '',
  net_pay: '',
})

const isEdit = ref(false)
const openEmployeePopover = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.row) {
        isEdit.value = true
        form.value = {
          employee_id: props.row.employee_id,
          account_no: props.row.account_no || '',
          net_pay: props.row.net_pay,
          bank_account_id: props.row.bank_account_id,
        }
      } else {
        isEdit.value = false
        form.value = {
          employee_id: null,
          account_no: '',
          net_pay: '',
          bank_account_id: null,
        }
      }
      errors.value = { employee_id: '', net_pay: '' }
    }
  },
)

const handleSubmit = () => {
  const validation = validateEmployeePayrollForm(form.value.employee_id, form.value.net_pay)
  if (!validation.valid) {
    errors.value = validation.errors
    return
  }

  const employeeData = allEmployees.value.find((e) => e.id === form.value.employee_id)
  let finalAccountNo = form.value.account_no
  let finalBankId = form.value.bank_account_id

  if (employeeData && !finalAccountNo) {
    finalAccountNo = employeeData.account_no || ''
    finalBankId = employeeData.bank_account_id
  }

  emit('submit', {
    employee_id: form.value.employee_id!,
    account_no: finalAccountNo,
    net_pay: Number(form.value.net_pay),
    bank_account_id: finalBankId,
  })
  emit('update:open', false)
}

function handleEmployeeSelect(empId: number) {
  const emp = allEmployees.value.find((e) => e.id === empId)
  form.value.employee_id = empId
  if (emp) {
    form.value.account_no = emp.account_no || ''
    form.value.bank_account_id = emp.bank_account_id
  }
  openEmployeePopover.value = false
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
        <SheetTitle>{{ isEdit ? 'Edit Employee Payroll' : 'Add Employee Payroll' }}</SheetTitle>
        <SheetDescription>
          {{
            isEdit
              ? 'Update the details of the employee payroll entry.'
              : 'Fill in the details to add an employee to this payroll batch.'
          }}
        </SheetDescription>
      </SheetHeader>

      <div class="grid gap-y-6 overflow-y-auto px-4 py-2">
        <!-- Employee -->
        <div class="grid gap-2">
          <Label>Employee <span class="text-destructive">*</span></Label>
          <Popover v-model:open="openEmployeePopover">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                :aria-expanded="openEmployeePopover"
                class="w-full justify-between"
                :class="!form.employee_id && 'text-muted-foreground'"
              >
                <span class="truncate">
                  {{
                    form.employee_id
                      ? allEmployees.find((x) => x.id === form.employee_id)?.name ||
                        props.row?.employee?.name
                      : 'Select employee...'
                  }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="p-0">
              <Command>
                <CommandInput placeholder="Search employee..." />
                <CommandEmpty>No employee found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      v-for="emp in allEmployees"
                      :key="emp.id"
                      :value="emp.name"
                      @select="() => handleEmployeeSelect(emp.id)"
                    >
                      <Check
                        :class="
                          cn(
                            'mr-2 h-4 w-4',
                            form.employee_id === emp.id ? 'opacity-100' : 'opacity-0',
                          )
                        "
                      />
                      {{ emp.name }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <span v-if="errors.employee_id" class="text-sm text-destructive">{{
            errors.employee_id
          }}</span>
        </div>

        <!-- Net Pay -->
        <div class="grid gap-2">
          <Label for="net_pay">Net Pay <span class="text-destructive">*</span></Label>
          <Input id="net_pay" type="number" step="0.01" v-model="form.net_pay" placeholder="0.00" />
          <span v-if="errors.net_pay" class="text-sm text-destructive">{{ errors.net_pay }}</span>
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
