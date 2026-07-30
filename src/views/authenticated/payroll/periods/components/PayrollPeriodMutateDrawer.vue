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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DatePicker from '@/components/ui/custom/DatePicker.vue'
import type { PayrollPeriod, CompensationType } from '@/types/payroll-period.types'
import {
  validatePayrollPeriodForm,
  type PayrollPeriodFormErrors,
} from '@/validators/payroll-period.validators'
import { today, getLocalTimeZone } from '@internationalized/date'

const todayString = () => today(getLocalTimeZone()).toString()

const props = defineProps<{
  open: boolean
  row: PayrollPeriod | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [
    data: {
      cutoff_start: string
      cutoff_end: string
      description: string | null
      compensation_type: CompensationType | null
    },
  ]
}>()

const compensationTypes: { value: CompensationType; label: string }[] = [
  { value: 'allowance', label: 'Allowance' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'honorarium', label: 'Honorarium' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'refund', label: 'Refund' },
  { value: 'wages', label: 'Wages' },
]

const form = ref<{
  cutoff_start: string
  cutoff_end: string
  description: string
  compensation_type: CompensationType | ''
}>({
  cutoff_start: '',
  cutoff_end: '',
  description: '',
  compensation_type: '',
})

const errors = ref<PayrollPeriodFormErrors>({
  cutoff_start: '',
  cutoff_end: '',
  description: '',
  compensation_type: '',
})

const isEdit = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.row) {
        isEdit.value = true
        form.value = {
          cutoff_start: props.row.cutoff_start,
          cutoff_end: props.row.cutoff_end,
          description: props.row.description ?? '',
          compensation_type: props.row.compensation_type ?? '',
        }
      } else {
        isEdit.value = false
        form.value = {
          cutoff_start: todayString(),
          cutoff_end: todayString(),
          description: '',
          compensation_type: '',
        }
      }
      errors.value = { cutoff_start: '', cutoff_end: '', description: '', compensation_type: '' }
    }
  },
)

const handleSubmit = () => {
  const validation = validatePayrollPeriodForm(
    form.value.cutoff_start,
    form.value.cutoff_end,
    form.value.description,
    form.value.compensation_type,
  )
  if (!validation.valid) {
    errors.value = validation.errors
    return
  }

  emit('submit', {
    cutoff_start: form.value.cutoff_start,
    cutoff_end: form.value.cutoff_end,
    description: form.value.description.trim() || null,
    compensation_type: (form.value.compensation_type as CompensationType) || null,
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
        <SheetTitle>{{ isEdit ? 'Edit Payroll Period' : 'Add Payroll Period' }}</SheetTitle>
        <SheetDescription>
          {{
            isEdit
              ? 'Update the details of the payroll period.'
              : 'Fill in the details to add a new payroll period.'
          }}
        </SheetDescription>
      </SheetHeader>
      <div class="flex-1 space-y-6 overflow-y-auto px-4 py-2">
        <div class="grid gap-4 py-6">
          <div class="grid gap-2">
            <Label for="cutoff_start">Cutoff Start <span class="text-destructive">*</span></Label>
            <DatePicker v-model="form.cutoff_start" class="w-full" placeholder="Pick start date" />
            <span v-if="errors.cutoff_start" class="text-sm text-destructive">{{
              errors.cutoff_start
            }}</span>
          </div>

          <div class="grid gap-2">
            <Label for="cutoff_end">Cutoff End <span class="text-destructive">*</span></Label>
            <DatePicker v-model="form.cutoff_end" class="w-full" placeholder="Pick end date" />
            <span v-if="errors.cutoff_end" class="text-sm text-destructive">{{
              errors.cutoff_end
            }}</span>
          </div>

          <div class="grid gap-2">
            <Label for="compensation_type">Compensation Type <span class="text-destructive">*</span></Label>
            <Select v-model="form.compensation_type">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select compensation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="item in compensationTypes"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <span v-if="errors.compensation_type" class="text-sm text-destructive">{{
              errors.compensation_type
            }}</span>
          </div>

          <div class="grid gap-2">
            <Label for="description">Description</Label>
            <Textarea
              v-model="form.description"
              placeholder="Enter optional description or notes..."
              rows="3"
            />
            <span v-if="errors.description" class="text-sm text-destructive">{{
              errors.description
            }}</span>
          </div>
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
