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
import type { PayrollBatchWithRelations } from '@/types/payroll-batch.types'

interface Props {
  open: boolean
  row: PayrollBatchWithRelations | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [row: PayrollBatchWithRelations]
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
        <AlertDialogTitle>Delete Payroll Batch</AlertDialogTitle>
        <AlertDialogDescription v-if="row">
          Are you sure you want to delete the payroll batch
          <span class="font-semibold text-foreground"> {{ row.batch_code }} </span>? This action
          cannot be undone.
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
