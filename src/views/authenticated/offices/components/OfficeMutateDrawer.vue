<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { Office } from '@/types/office.types'
import { Switch } from '@/components/ui/switch'
import { validateOfficeForm } from '@/validators/office.validators'

// ─── Props & Emits ────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  row?: Office | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: { office_code: string; office_name: string; abbreviation: string; status: string }]
}>()

// ─── Form state ───────────────────────────────────────────────────────────────
const officeCode = ref('')
const officeName = ref('')
const abbreviation = ref('')
const status = ref(true)
const errors = ref({ officeCode: '', officeName: '', abbreviation: '', status: '' })

const isEdit = computed(() => !!props.row)
const drawerTitle = computed(() => (isEdit.value ? 'Update Office' : 'Create Office'))
const drawerDescription = computed(() =>
  isEdit.value
    ? "Update the office by providing necessary info. Click save when you're done."
    : "Add a new office by providing necessary info. Click save when you're done.",
)

// ─── Sync form fields when the target row changes ─────────────────────────────

watch(
  [() => props.open, () => props.row],
  ([isOpen, val]) => {
    if (isOpen) {
      if (val) {
        officeCode.value = val.office_code ?? ''
        officeName.value = val.office_name ?? ''
        abbreviation.value = val.abbreviation ?? ''
        status.value = val.status === 'active'
      } else {
        officeCode.value = ''
        officeName.value = ''
        abbreviation.value = ''
        status.value = true
      }
      errors.value = { officeCode: '', officeName: '', abbreviation: '', status: '' }
    }
  },
  { immediate: true },
)

function handleSubmit() {
  const result = validateOfficeForm(
    officeCode.value,
    officeName.value,
    abbreviation.value,
    status.value ? 'active' : 'inactive',
  )
  errors.value = result.errors

  if (!result.valid) return

  emit('submit', {
    office_code: officeCode.value.trim(),
    office_name: officeName.value.trim(),
    abbreviation: abbreviation.value?.trim() || '',
    status: status.value ? 'active' : 'inactive',
  })
  close()
}

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Sheet :open="props.open" @update:open="close">
    <SheetContent class="flex flex-col">
      <SheetHeader class="text-start">
        <SheetTitle>{{ drawerTitle }}</SheetTitle>
        <SheetDescription>{{ drawerDescription }}</SheetDescription>
      </SheetHeader>

      <!-- Form -->
      <div class="flex-1 space-y-6 overflow-y-auto px-4 py-2">
        <!-- Office Code -->
        <div class="flex flex-col gap-2">
          <Label for="office-code">Office Code</Label>
          <Input id="office-code" v-model="officeCode" placeholder="Enter office code" />
          <p v-if="errors.officeCode" class="text-sm text-destructive">{{ errors.officeCode }}</p>
        </div>
        <!-- Name -->
        <div class="flex flex-col gap-2">
          <Label for="office-name">Name</Label>
          <Input id="office-name" v-model="officeName" placeholder="Enter office name" />
          <p v-if="errors.officeName" class="text-sm text-destructive">{{ errors.officeName }}</p>
        </div>

        <!-- Abbreviation -->
        <div class="flex flex-col gap-2">
          <Label for="office-abbreviation">Abbreviation</Label>
          <Input
            id="office-abbreviation"
            v-model="abbreviation"
            placeholder="Enter office abbreviation"
          />
          <p v-if="errors.abbreviation" class="text-sm text-destructive">
            {{ errors.abbreviation }}
          </p>
        </div>

        <!-- Status -->
        <div class="flex flex-row items-center justify-between rounded-lg border p-4">
          <div class="space-y-0.5">
            <Label for="office-status" class="text-base">Active Status</Label>
            <p class="text-sm text-muted-foreground">
              Determines if the office is currently active.
            </p>
          </div>
          <Switch id="office-status" v-model="status" />
          <p v-if="errors.status" class="text-sm text-destructive">{{ errors.status }}</p>
        </div>
      </div>

      <SheetFooter class="gap-2">
        <SheetClose as-child>
          <Button variant="outline" @click="close">Close</Button>
        </SheetClose>
        <Button @click="handleSubmit">Save changes</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
