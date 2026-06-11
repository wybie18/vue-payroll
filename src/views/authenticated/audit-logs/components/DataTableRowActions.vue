<script setup lang="ts">
import { Eye } from '@lucide/vue'
import type { Row } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'

interface Props {
  row: Row<any>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  show: [row: any]
}>()
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    class="h-8 w-8"
    @click="emit('show', props.row.original)"
  >
    <Eye class="h-4 w-4 text-muted-foreground hover:text-foreground" />
    <span class="sr-only">Show details</span>
  </Button>
</template>
