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
import type { PayrollAdaBatchWithRelations } from '@/types/payroll-ada-batch.types'

interface Props {
  open: boolean
  row: PayrollAdaBatchWithRelations | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [row: PayrollAdaBatchWithRelations]
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
        <AlertDialogDescription v-if="row?.batch_id">
          Are you sure you want to delete the payroll batch
          <span class="font-semibold text-foreground"> {{ row.batch_code }} </span>
          from this ADA? The batch itself will not be deleted.
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
