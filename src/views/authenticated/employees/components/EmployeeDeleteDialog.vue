<script setup lang="ts">
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
import type { Employee } from '@/types/employee.types'

// ─── Props & Emits ────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  row?: Employee | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [row: Employee]
}>()

// ─── Handlers ─────────────────────────────────────────────────────────────────

function handleConfirm() {
  if (props.row) emit('confirm', props.row)
  emit('update:open', false)
}
</script>

<template>
  <AlertDialog :open="props.open" @update:open="emit('update:open', $event)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Employee</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete
          <span class="font-semibold text-foreground">{{ props.row?.name }}</span
          >? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          @click="handleConfirm"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
