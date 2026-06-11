<script setup lang="ts">
import { computed } from 'vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatDate } from '@/helpers/date.helper'
import type { PayrollPeriod } from '@/types/payroll-period.types'

interface Props {
  open: boolean
  row: PayrollPeriod | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [row: PayrollPeriod]
}>()

const localOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})
</script>

<template>
  <AlertDialog v-model:open="localOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Payroll Period</AlertDialogTitle>
        <AlertDialogDescription v-if="row">
          Are you sure you want to delete the payroll period 
          <span class="font-semibold text-foreground">
            {{ formatDate(row.cutoff_start) }} to {{ formatDate(row.cutoff_end) }}
          </span>?
          This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          @click="
            () => {
              if (row) emit('confirm', row)
              localOpen = false
            }
          "
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
