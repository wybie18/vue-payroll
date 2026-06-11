<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { AuditLogWithProfile } from '@/types/audit-log.types'
import { formatDate } from '@/helpers/date.helper'

interface Props {
  open: boolean
  row?: AuditLogWithProfile | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const showOnlyChanges = ref(true)

// Helper to format field name (e.g. employment_status -> Employment Status)
function formatFieldName(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper to format values for display
function formatValue(value: any): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

// Get all unique keys from old_data and new_data
const allKeys = computed(() => {
  if (!props.row) return []
  const oldKeys = Object.keys(props.row.old_data || {})
  const newKeys = Object.keys(props.row.new_data || {})
  // Get unique keys sorted alphabetically
  return Array.from(new Set([...oldKeys, ...newKeys])).sort()
})

// Build the comparison diff rows
const diffRows = computed(() => {
  if (!props.row) return []

  const oldData = props.row.old_data || {}
  const newData = props.row.new_data || {}

  const rows = allKeys.value.map((key) => {
    const oldVal = oldData[key]
    const newVal = newData[key]
    const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal)

    return {
      key,
      label: formatFieldName(key),
      oldVal: formatValue(oldVal),
      newVal: formatValue(newVal),
      isChanged,
    }
  })

  if (showOnlyChanges.value && props.row.action.toUpperCase() === 'UPDATE') {
    return rows.filter((r) => r.isChanged)
  }

  return rows
})

// Format Action display helper
const actionColor = computed(() => {
  if (!props.row) return ''
  const action = props.row.action.toUpperCase()
  if (action === 'INSERT')
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
  if (action === 'UPDATE')
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
  if (action === 'DELETE') return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
  return 'bg-slate-100 text-slate-800'
})

const changerName = computed(() => {
  if (!props.row?.profile) return 'System'
  const p = props.row.profile
  return [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email
})

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Sheet :open="props.open" @update:open="close">
    <SheetContent class="flex flex-col w-full sm:max-w-2xl overflow-hidden">
      <SheetHeader class="text-start">
        <div class="flex items-center gap-2">
          <SheetTitle>Audit Log Details</SheetTitle>
          <span
            v-if="props.row"
            :class="`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${actionColor}`"
          >
            {{ props.row.action }}
          </span>
        </div>
        <SheetDescription>
          Detailed change analysis for table:
          <span class="font-semibold text-foreground">{{ props.row?.table_name }}</span>
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 space-y-6 overflow-y-auto px-4 py-2">
        <!-- Metadata summary grid -->
        <div
          v-if="props.row"
          class="grid grid-cols-2 gap-4 rounded-lg border bg-muted/40 p-4 text-sm mt-2"
        >
          <div>
            <span class="text-muted-foreground block text-xs">Timestamp</span>
            <span class="font-medium">{{ formatDate(props.row.changed_at) }}</span>
          </div>
          <div>
            <span class="text-muted-foreground block text-xs">Performed By</span>
            <span class="font-medium flex flex-col">
              <span>{{ changerName }}</span>
              <span v-if="props.row.profile" class="text-xs text-muted-foreground">{{
                props.row.profile.email
              }}</span>
            </span>
          </div>
        </div>

        <!-- Toggle to show only changes (only relevant for Update) -->
        <div
          v-if="props.row?.action.toUpperCase() === 'UPDATE'"
          class="flex items-center justify-between rounded-lg border p-4 my-2"
        >
          <div class="space-y-0.5">
            <Label for="show-changes-toggle" class="text-sm font-semibold">Filter changes</Label>
            <p class="text-xs text-muted-foreground">
              Only show fields that were modified during this update.
            </p>
          </div>
          <Switch id="show-changes-toggle" v-model="showOnlyChanges" />
        </div>

        <!-- Diff Comparison list -->
        <div class="flex-1 overflow-y-auto mt-2 border rounded-md">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b bg-muted/50 text-xs font-medium text-muted-foreground">
                <th class="p-3 text-start w-1/4">Field</th>
                <th
                  class="p-3 text-start w-3/8"
                  v-if="props.row?.action.toUpperCase() !== 'INSERT'"
                >
                  Before
                </th>
                <th
                  class="p-3 text-start w-3/8"
                  v-if="props.row?.action.toUpperCase() !== 'DELETE'"
                >
                  After
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in diffRows"
                :key="row.key"
                :class="[
                  'border-b transition-colors hover:bg-muted/30',
                  row.isChanged && props.row?.action.toUpperCase() === 'UPDATE'
                    ? 'bg-amber-500/5 dark:bg-amber-500/10'
                    : '',
                ]"
              >
                <td class="p-3 font-semibold text-xs border-r">{{ row.label }}</td>

                <!-- Before (Old Value) -->
                <td
                  v-if="props.row?.action.toUpperCase() !== 'INSERT'"
                  :class="[
                    'p-3 font-mono text-xs max-w-0 truncate border-r align-top',
                    row.isChanged && props.row?.action.toUpperCase() === 'UPDATE'
                      ? 'text-rose-600 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-500/10'
                      : '',
                  ]"
                  :title="row.oldVal"
                >
                  {{ row.oldVal }}
                </td>

                <!-- After (New Value) -->
                <td
                  v-if="props.row?.action.toUpperCase() !== 'DELETE'"
                  :class="[
                    'p-3 font-mono text-xs max-w-0 truncate align-top',
                    row.isChanged && props.row?.action.toUpperCase() === 'UPDATE'
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 font-semibold'
                      : '',
                  ]"
                  :title="row.newVal"
                >
                  {{ row.newVal }}
                </td>
              </tr>
              <tr v-if="diffRows.length === 0">
                <td colspan="3" class="p-6 text-center text-muted-foreground">
                  No changes recorded.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <SheetFooter class="mt-auto pt-4 gap-2 border-t">
        <SheetClose as-child>
          <Button variant="outline" @click="close">Close</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
