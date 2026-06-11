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
import DatePicker from '@/components/ui/custom/DatePicker.vue'
import type { PayrollPeriod } from '@/types/payroll-period.types'
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
  submit: [data: { cutoff_start: string; cutoff_end: string }]
}>()

const form = ref({
  cutoff_start: '',
  cutoff_end: '',
})

const errors = ref<PayrollPeriodFormErrors>({
  cutoff_start: '',
  cutoff_end: '',
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
        }
      } else {
        isEdit.value = false
        form.value = {
          cutoff_start: todayString(),
          cutoff_end: todayString(),
        }
      }
      errors.value = { cutoff_start: '', cutoff_end: '' }
    }
  },
)

const handleSubmit = () => {
  const validation = validatePayrollPeriodForm(form.value.cutoff_start, form.value.cutoff_end)
  if (!validation.valid) {
    errors.value = validation.errors
    return
  }

  emit('submit', {
    cutoff_start: form.value.cutoff_start,
    cutoff_end: form.value.cutoff_end,
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
            <Label for="cutoff_start">Cutoff Start</Label>
            <DatePicker v-model="form.cutoff_start" class="w-full" placeholder="Pick start date" />
            <span v-if="errors.cutoff_start" class="text-sm text-destructive">{{
              errors.cutoff_start
            }}</span>
          </div>

          <div class="grid gap-2">
            <Label for="cutoff_end">Cutoff End</Label>
            <DatePicker v-model="form.cutoff_end" class="w-full" placeholder="Pick end date" />
            <span v-if="errors.cutoff_end" class="text-sm text-destructive">{{
              errors.cutoff_end
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
