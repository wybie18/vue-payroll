<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { watchDebounced } from '@vueuse/core'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown, Search } from '@lucide/vue'
import { cn } from '@/lib/utils'

import type { EmployeePayrollWithEmployee } from '@/types/employee-payroll.types'
import type { Employee } from '@/types/employee.types'
import {
  validateEmployeePayrollForm,
  type EmployeePayrollFormErrors,
} from '@/validators/employee-payroll.validators'
import { listEmployees } from '@/services/employee.service'

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

// Infinite scroll & search dropdown states
const employeesList = ref<Employee[]>([])
const searchQuery = ref('')
const isLoadingEmployees = ref(false)
const isLoadingMore = ref(false)
const employeePage = ref(1)
const hasMoreEmployees = ref(true)
const currentlySelectedEmployee = ref<Employee | null>(null)

// Compute selected employee name safely, handling edit state fallback
const selectedEmployeeName = computed(() => {
  if (!form.value.employee_id) return ''
  const found = employeesList.value.find((e) => e.id === form.value.employee_id)
  if (found) return found.name
  if (props.row && props.row.employee_id === form.value.employee_id && props.row.employee) {
    return props.row.employee.name
  }
  if (
    currentlySelectedEmployee.value &&
    currentlySelectedEmployee.value.id === form.value.employee_id
  ) {
    return currentlySelectedEmployee.value.name
  }
  return 'Loading...'
})

// Fetch employees for dropdown (with pagination + search)
async function fetchEmployeesDropdown(reset = false) {
  if (reset) {
    employeePage.value = 1
    hasMoreEmployees.value = true
    employeesList.value = []
    isLoadingEmployees.value = true
  } else {
    isLoadingMore.value = true
  }

  try {
    const { data, count, error } = await listEmployees({
      page: employeePage.value,
      pageSize: 20,
      search: searchQuery.value,
    })

    if (!error) {
      if (reset) {
        employeesList.value = data
      } else {
        employeesList.value = [...employeesList.value, ...data]
      }
      hasMoreEmployees.value = employeesList.value.length < count
    }
  } catch (err) {
    console.error('[EmployeePayrollMutateDrawer] Error fetching employees:', err)
  } finally {
    isLoadingEmployees.value = false
    isLoadingMore.value = false
  }
}

// Watch for search query change (debounced)
watchDebounced(
  searchQuery,
  () => {
    fetchEmployeesDropdown(true)
  },
  { debounce: 300 },
)

// Scroll handler for infinite scroll
function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  if (
    target.scrollHeight - target.scrollTop <= target.clientHeight + 15 &&
    !isLoadingEmployees.value &&
    !isLoadingMore.value &&
    hasMoreEmployees.value
  ) {
    employeePage.value++
    fetchEmployeesDropdown(false)
  }
}

// Fetch when the popover opens
watch(openEmployeePopover, (isOpen) => {
  if (isOpen) {
    searchQuery.value = ''
    fetchEmployeesDropdown(true)
  }
})

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
        currentlySelectedEmployee.value = null
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

  const employeeData =
    employeesList.value.find((e) => e.id === form.value.employee_id) ||
    currentlySelectedEmployee.value
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

function handleEmployeeSelect(emp: Employee) {
  form.value.employee_id = emp.id
  currentlySelectedEmployee.value = emp
  form.value.account_no = emp.account_no || ''
  form.value.bank_account_id = emp.bank_account_id
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
                  {{ form.employee_id ? selectedEmployeeName : 'Select employee...' }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="p-0 w-(--radix-popover-trigger-width)">
              <div class="flex flex-col max-h-75 w-full overflow-hidden">
                <!-- Search input -->
                <div class="flex items-center border-b px-3 shrink-0">
                  <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <input
                    v-model="searchQuery"
                    class="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Search employee..."
                  />
                </div>
                <!-- Scrollable container -->
                <div class="flex-1 overflow-y-auto p-1 max-h-65" @scroll="handleScroll">
                  <div
                    v-if="isLoadingEmployees && employeesList.length === 0"
                    class="py-6 text-center text-sm text-muted-foreground"
                  >
                    Loading employees...
                  </div>
                  <div
                    v-else-if="employeesList.length === 0"
                    class="py-6 text-center text-sm text-muted-foreground"
                  >
                    No employee found.
                  </div>
                  <div v-else class="space-y-1">
                    <button
                      v-for="emp in employeesList"
                      :key="emp.id"
                      type="button"
                      class="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 text-left"
                      @click="handleEmployeeSelect(emp)"
                    >
                      <Check
                        :class="
                          cn(
                            'mr-2 h-4 w-4 shrink-0',
                            form.employee_id === emp.id ? 'opacity-100' : 'opacity-0',
                          )
                        "
                      />
                      <div class="flex flex-col truncate">
                        <span class="font-medium truncate">{{ emp.name }}</span>
                        <span
                          v-if="emp.employee_no"
                          class="text-xs text-muted-foreground truncate"
                          >{{ emp.employee_no }}</span
                        >
                      </div>
                    </button>
                    <div
                      v-if="isLoadingMore"
                      class="py-2 text-center text-xs text-muted-foreground"
                    >
                      Loading more...
                    </div>
                  </div>
                </div>
              </div>
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
