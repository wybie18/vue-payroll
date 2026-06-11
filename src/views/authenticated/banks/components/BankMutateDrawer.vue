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
import type { Bank } from '@/types/bank.types'
import { validateBankForm } from '@/validators/bank.validators'

// ─── Props & Emits ────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  row?: Bank | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: { bank_name: string; bank_abbreviation: string | null; branch_name: string | null; address: string | null }]
}>()

// ─── Form state ───────────────────────────────────────────────────────────────
const bankName = ref('')
const bankAbbreviation = ref('')
const branchName = ref('')
const address = ref('')
const errors = ref({ bankName: '', bankAbbreviation: '', branchName: '', address: '' })

const isEdit = computed(() => !!props.row)
const drawerTitle = computed(() => (isEdit.value ? 'Update Bank' : 'Create Bank'))
const drawerDescription = computed(() =>
  isEdit.value
    ? "Update the bank by providing necessary info. Click save when you're done."
    : "Add a new bank by providing necessary info. Click save when you're done.",
)

// ─── Sync form fields when the target row changes ─────────────────────────────

watch(
  [() => props.open, () => props.row],
  ([isOpen, val]) => {
    if (isOpen) {
      if (val) {
        bankName.value = val.bank_name ?? ''
        bankAbbreviation.value = val.bank_abbreviation ?? ''
        branchName.value = val.branch_name ?? ''
        address.value = val.address ?? ''
      } else {
        bankName.value = ''
        bankAbbreviation.value = ''
        branchName.value = ''
        address.value = ''
      }
      errors.value = { bankName: '', bankAbbreviation: '', branchName: '', address: '' }
    }
  },
  { immediate: true },
)

function handleSubmit() {
  const result = validateBankForm(
    bankName.value,
    bankAbbreviation.value,
    branchName.value,
    address.value,
  )
  errors.value = result.errors

  if (!result.valid) return

  emit('submit', {
    bank_name: bankName.value.trim(),
    bank_abbreviation: bankAbbreviation.value.trim() || null,
    branch_name: branchName.value.trim() || null,
    address: address.value.trim() || null,
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
        <!-- Bank Name -->
        <div class="flex flex-col gap-2">
          <Label for="bank-name">Bank Name</Label>
          <Input id="bank-name" v-model="bankName" placeholder="Enter bank name" />
          <p v-if="errors.bankName" class="text-sm text-destructive">{{ errors.bankName }}</p>
        </div>

        <!-- Bank Abbreviation -->
        <div class="flex flex-col gap-2">
          <Label for="bank-abbreviation">Abbreviation</Label>
          <Input id="bank-abbreviation" v-model="bankAbbreviation" placeholder="Enter bank abbreviation" />
          <p v-if="errors.bankAbbreviation" class="text-sm text-destructive">{{ errors.bankAbbreviation }}</p>
        </div>
        
        <!-- Branch Name -->
        <div class="flex flex-col gap-2">
          <Label for="branch-name">Branch Name</Label>
          <Input id="branch-name" v-model="branchName" placeholder="Enter branch name" />
          <p v-if="errors.branchName" class="text-sm text-destructive">{{ errors.branchName }}</p>
        </div>

        <!-- Address -->
        <div class="flex flex-col gap-2">
          <Label for="address">Address</Label>
          <Input
            id="address"
            v-model="address"
            placeholder="Enter address"
          />
          <p v-if="errors.address" class="text-sm text-destructive">
            {{ errors.address }}
          </p>
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
