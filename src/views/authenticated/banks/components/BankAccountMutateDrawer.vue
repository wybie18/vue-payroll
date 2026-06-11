<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Check, ChevronsUpDown } from '@lucide/vue'
import { cn } from '@/lib/utils'
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FUND_SOURCES, type BankAccount } from '@/types/bank.types'
import { validateBankAccountForm } from '@/validators/bank.validators'
import { useBanks } from '@/composables/banks/useBanks'

// ─── Props & Emits ────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  row?: BankAccount | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [data: { bank_id: number; account_number: string; fund_source: string }]
}>()

// ─── Form state ───────────────────────────────────────────────────────────────
const bankId = ref('')
const accountNumber = ref('')
const fundSource = ref('')
const errors = ref({ bankId: '', accountNumber: '', fundSource: '' })

const bankOpen = ref(false)
const fundSourceOpen = ref(false)

// ─── Dependencies ─────────────────────────────────────────────────────────────
const { banks, fetchBanks } = useBanks()

onMounted(async () => {
  await fetchBanks() // fetch all banks for the select dropdown
})

const isEdit = computed(() => !!props.row)
const drawerTitle = computed(() => (isEdit.value ? 'Update Bank Account' : 'Create Bank Account'))
const drawerDescription = computed(() =>
  isEdit.value
    ? "Update the bank account by providing necessary info. Click save when you're done."
    : "Add a new bank account by providing necessary info. Click save when you're done.",
)

// ─── Sync form fields when the target row changes ─────────────────────────────

watch(
  [() => props.open, () => props.row],
  ([isOpen, val]) => {
    if (isOpen) {
      if (val) {
        bankId.value = val.bank_id.toString()
        accountNumber.value = val.account_number ?? ''
        fundSource.value = val.fund_source ?? ''
      } else {
        bankId.value = ''
        accountNumber.value = ''
        fundSource.value = ''
      }
      errors.value = { bankId: '', accountNumber: '', fundSource: '' }
    }
  },
  { immediate: true },
)

function handleSubmit() {
  const selectedBankId = bankId.value ? parseInt(bankId.value) : null
  const result = validateBankAccountForm(selectedBankId, accountNumber.value, fundSource.value)
  errors.value = result.errors

  if (!result.valid || !selectedBankId) return

  emit('submit', {
    bank_id: selectedBankId,
    account_number: accountNumber.value.trim(),
    fund_source: fundSource.value.trim(),
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
        <!-- Bank Select -->
        <div class="flex flex-col gap-2">
          <Label for="bank-id">Bank</Label>
          <Popover v-model:open="bankOpen">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                :aria-expanded="bankOpen"
                class="w-full justify-between"
                :class="!bankId && 'text-muted-foreground'"
              >
                <span class="truncate">
                  {{
                    bankId
                      ? (() => {
                          const acc = banks.find((a) => a.bank_id.toString() === bankId)
                          return acc
                            ? `${acc.bank_abbreviation} ${acc.branch_name ? `(${acc.branch_name})` : ''}`
                            : ''
                        })()
                      : 'Select bank...'
                  }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="p-0">
              <Command>
                <CommandInput placeholder="Search bank..." />
                <CommandEmpty>No bank found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      v-for="bank in banks"
                      :key="bank.bank_id"
                      :value="bank.bank_name"
                      @select="
                        () => {
                          bankId = bankId === bank.bank_id.toString() ? '' : bank.bank_id.toString()
                          bankOpen = false
                        }
                      "
                    >
                      <Check
                        :class="
                          cn(
                            'mr-2 h-4 w-4',
                            bankId === bank.bank_id.toString() ? 'opacity-100' : 'opacity-0',
                          )
                        "
                      />
                      {{ bank.bank_abbreviation }}
                      {{ bank.branch_name ? `(${bank.branch_name})` : '' }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p v-if="errors.bankId" class="text-sm text-destructive">{{ errors.bankId }}</p>
        </div>

        <!-- Account Number -->
        <div class="flex flex-col gap-2">
          <Label for="account-number">Account Number</Label>
          <Input id="account-number" v-model="accountNumber" placeholder="Enter account number" />
          <p v-if="errors.accountNumber" class="text-sm text-destructive">
            {{ errors.accountNumber }}
          </p>
        </div>

        <!-- Fund Source -->
        <div class="flex flex-col gap-2">
          <Label for="fund-source">Fund Source</Label>
          <Popover v-model:open="fundSourceOpen">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                :aria-expanded="fundSourceOpen"
                class="w-full justify-between"
                :class="!fundSource && 'text-muted-foreground'"
              >
                <span class="truncate">
                  {{
                    fundSource
                      ? FUND_SOURCES.find((f) => f.value === fundSource)?.label
                      : 'Select fund source...'
                  }}
                </span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent class="p-0">
              <Command>
                <CommandInput placeholder="Search fund source..." />
                <CommandEmpty>No fund source found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      v-for="source in FUND_SOURCES"
                      :key="source.value"
                      :value="source.label"
                      @select="
                        () => {
                          fundSource = fundSource === source.value ? '' : source.value
                          fundSourceOpen = false
                        }
                      "
                    >
                      <Check
                        :class="
                          cn(
                            'mr-2 h-4 w-4',
                            fundSource === source.value ? 'opacity-100' : 'opacity-0',
                          )
                        "
                      />
                      {{ source.label }}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p v-if="errors.fundSource" class="text-sm text-destructive">{{ errors.fundSource }}</p>
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
