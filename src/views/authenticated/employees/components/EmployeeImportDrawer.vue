<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
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
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clipboard, Download, AlertTriangle, FileSpreadsheet } from '@lucide/vue'
import FileDropzone from '@/components/ui/custom/FileDropzone.vue'
import { useOffices } from '@/composables/offices/useOffices'
import { useBankAccounts } from '@/composables/banks/useBankAccounts'
import Papa from 'papaparse'
import type { Employee } from '@/types/employee.types'
import { Separator } from '@/components/ui/separator'

const VALID_EMPLOYMENT_STATUSES = [
  'Permanent',
  'Temporary',
  'Coterminous',
  'Elected',
  'Casual',
  'Job Order',
  'Contract of Service',
  'Consultant',
  'Detailed',
  'Probationary',
  'Appointed',
] as const

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [payload: Omit<Employee, 'id' | 'created_at' | 'updated_at'>[]]
}>()

const { allOffices, fetchAllOffices } = useOffices()
const { allAccountsWithBank, fetchAllAccountsWithBank } = useBankAccounts()

onMounted(async () => {
  await fetchAllOffices()
  await fetchAllAccountsWithBank()
})

const activeTab = ref('upload')
const pastedText = ref('')
const selectedFileName = ref('')

interface ParsedRow {
  name: string
  employee_no: string
  eenggas_no: string
  office_id: number
  office_code: string
  bank_account_id: number
  bank_account_number: string
  account_no: string
  status: string
  employment_status: Employee['employment_status']
}

const parsedRows = ref<ParsedRow[]>([])
const validationErrors = ref<string[]>([])

const downloadTemplate = () => {
  const csvContent =
    'name,employee no,eenggas no,office code,bank account number,personal account number,employment status\nJuan Dela Cruz,EMP-101,EEG-201,HRMO,1234567890,9988776655,Permanent\nMaria Santos,EMP-102,EEG-202,MAYOR,0987654321,5566778899,Casual'
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'employee_import_template.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleParseContent = (content: string) => {
  parsedRows.value = []
  validationErrors.value = []

  const parsed = Papa.parse<string[]>(content.trim(), {
    skipEmptyLines: true,
  })

  if (parsed.errors && parsed.errors.length > 0) {
    validationErrors.value = parsed.errors.map(
      (e) => `CSV Parse Error: ${e.message} at row ${e.row}`,
    )
    return
  }

  const data = parsed.data
  const tempRows: ParsedRow[] = []
  const tempErrors: string[] = []

  data.forEach((row, index) => {
    const firstCol = row[0]?.trim() || ''
    const secondCol = row[1]?.trim() || ''

    // Detect header row and skip
    if (
      index === 0 &&
      (firstCol.toLowerCase().includes('name') ||
        secondCol.toLowerCase().includes('employee') ||
        secondCol.toLowerCase().includes('no'))
    ) {
      return
    }

    if (row.length < 7) {
      tempErrors.push(`Row ${index + 1}: Expected 7 columns, got ${row.length}`)
      return
    }

    const name = row[0]?.trim() || ''
    const employeeNo = row[1]?.trim() || ''
    const eenggasNo = row[2]?.trim() || ''
    const officeCode = row[3]?.trim() || ''
    const bankAccountNumber = row[4]?.trim() || ''
    const personalAccountNo = row[5]?.trim() || ''
    const employmentStatus = row[6]?.trim() || ''

    if (!name) {
      tempErrors.push(`Row ${index + 1}: Name is required`)
      return
    }

    if (!employeeNo) {
      tempErrors.push(`Row ${index + 1}: Employee No is required`)
      return
    }

    if (!eenggasNo) {
      tempErrors.push(`Row ${index + 1}: Eenggas No is required`)
      return
    }

    if (!officeCode) {
      tempErrors.push(`Row ${index + 1}: Office Code/Abbreviation is required`)
      return
    }

    if (!bankAccountNumber) {
      tempErrors.push(`Row ${index + 1}: Agency Bank Account Number is required`)
      return
    }

    if (!personalAccountNo) {
      tempErrors.push(`Row ${index + 1}: Personal Account Number is required`)
      return
    }

    if (!employmentStatus) {
      tempErrors.push(`Row ${index + 1}: Employment Status is required`)
      return
    }

    const matchedStatus = VALID_EMPLOYMENT_STATUSES.find(
      (s) => s.toLowerCase() === employmentStatus.toLowerCase(),
    )

    if (!matchedStatus) {
      tempErrors.push(
        `Row ${index + 1}: Employment Status "${employmentStatus}" is invalid. Must be one of: ${VALID_EMPLOYMENT_STATUSES.join(', ')}`,
      )
      return
    }

    const office = allOffices.value.find(
      (o) =>
        o.office_code.trim().toLowerCase() === officeCode.toLowerCase() ||
        String(o.abbreviation).trim().toLowerCase() === officeCode.toLowerCase(),
    )

    if (!office) {
      tempErrors.push(`Row ${index + 1}: Office with code/abbreviation "${officeCode}" not found`)
      return
    }

    const bankAccount = allAccountsWithBank.value.find(
      (a) => a.account_number.trim().toLowerCase() === bankAccountNumber.toLowerCase(),
    )

    if (!bankAccount) {
      tempErrors.push(`Row ${index + 1}: Bank account "${bankAccountNumber}" not found in system`)
      return
    }

    tempRows.push({
      name,
      employee_no: employeeNo,
      eenggas_no: eenggasNo,
      office_id: office.office_id,
      office_code: office.abbreviation || office.office_code,
      bank_account_id: bankAccount.bank_account_id,
      bank_account_number: bankAccount.account_number,
      account_no: personalAccountNo,
      status: 'active',
      employment_status: matchedStatus,
    })
  })

  parsedRows.value = tempRows
  validationErrors.value = tempErrors
}

const handleFileChange = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    handleParseContent(text)
  }
  reader.readAsText(file)
}

const handleFileClear = () => {
  parsedRows.value = []
  validationErrors.value = []
}

watch(pastedText, (val) => {
  if (activeTab.value === 'paste') {
    handleParseContent(val)
  }
})

watch(activeTab, () => {
  parsedRows.value = []
  validationErrors.value = []
  pastedText.value = ''
  selectedFileName.value = ''
})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      pastedText.value = ''
      parsedRows.value = []
      validationErrors.value = []
      selectedFileName.value = ''
    }
  },
)

const handleImportSubmit = () => {
  if (parsedRows.value.length === 0) return

  const payload = parsedRows.value.map((row) => ({
    name: row.name,
    office_id: row.office_id,
    bank_account_id: row.bank_account_id,
    account_no: row.account_no,
    status: row.status,
    employee_no: row.employee_no,
    eenggas_no: row.eenggas_no,
    employment_status: row.employment_status,
  }))

  emit('submit', payload)
  close()
}

const close = () => {
  emit('update:open', false)
}
</script>

<template>
  <Sheet :open="open" @update:open="close">
    <SheetContent class="flex flex-col sm:max-w-xl">
      <SheetHeader class="text-start">
        <SheetTitle>Import Employees</SheetTitle>
        <SheetDescription>
          Import bulk employee accounts using a CSV file or direct text input.
        </SheetDescription>
      </SheetHeader>

      <div class="flex-1 space-y-6 overflow-y-auto px-4 py-2">
        <!-- Template Download and Preview -->
        <div class="rounded-lg border border-dashed p-4 space-y-3 bg-muted/20">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold flex items-center gap-1.5">
              <FileSpreadsheet :size="16" class="text-primary" />
              Template Format
            </span>
            <Button variant="ghost" size="sm" class="h-8 gap-1.5" @click="downloadTemplate">
              <Download :size="14" />
              Download Template
            </Button>
          </div>
          <div class="text-xs text-muted-foreground space-y-1">
            <p>Your import should contain the following columns in order:</p>
            <code class="block bg-muted p-2 rounded-md font-mono text-foreground mt-1">
              name, employee no, eenggas no, office code, bank account number, personal account
              number, employment status<br />
              Juan Dela Cruz, EMP-101, EEG-201, HRMO, 1234567890, 9988776655, Permanent
            </code>
            <p class="text-[10px] text-muted-foreground mt-2">
              * Office code (or abbreviation) and agency bank account number must match active
              records. Employment status must be one of the 11 valid options (e.g. Permanent,
              Casual). Imported employees default to "active" status.
            </p>
          </div>
        </div>

        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="upload" class="gap-1.5">
              <FileSpreadsheet :size="15" />
              Upload CSV
            </TabsTrigger>
            <TabsTrigger value="paste" class="gap-1.5">
              <Clipboard :size="15" />
              Paste Text
            </TabsTrigger>
          </TabsList>

          <!-- Tab Content: CSV File Upload -->
          <TabsContent value="upload" class="space-y-4 pt-4">
            <FileDropzone
              accept=".csv"
              v-model:fileName="selectedFileName"
              description="Drag and drop your CSV file here"
              successMessage="CSV file parsed successfully"
              @change="handleFileChange"
              @clear="handleFileClear"
            />
          </TabsContent>

          <!-- Tab Content: Text Paste -->
          <TabsContent value="paste" class="space-y-4 pt-4">
            <div class="grid gap-2">
              <Textarea
                id="csv-text"
                v-model="pastedText"
                placeholder="Juan Dela Cruz, EMP-101, EEG-201, HRMO, 1234567890, 9988776655, Permanent&#10;Maria Santos, EMP-102, EEG-202, MAYOR, 0987654321, 5566778899, Casual"
                rows="8"
                class="font-mono text-sm"
              />
            </div>
          </TabsContent>
        </Tabs>

        <!-- Preview and Errors Section -->
        <div class="space-y-4" v-if="parsedRows.length > 0 || validationErrors.length > 0">
          <Separator />

          <!-- Errors -->
          <div v-if="validationErrors.length > 0" class="space-y-2">
            <h4 class="text-sm font-semibold text-destructive flex items-center gap-1.5">
              <AlertTriangle :size="16" />
              Validation Issues ({{ validationErrors.length }})
            </h4>
            <div
              class="max-h-36 overflow-y-auto border border-destructive/20 bg-destructive/5 rounded-md p-3 text-xs space-y-1 text-destructive font-mono"
            >
              <div v-for="(err, idx) in validationErrors" :key="idx">• {{ err }}</div>
            </div>
          </div>

          <!-- Preview -->
          <div v-if="parsedRows.length > 0" class="space-y-2">
            <h4 class="text-sm font-semibold text-foreground">
              Valid Rows Preview ({{ parsedRows.length }})
            </h4>
            <div class="border rounded-md overflow-hidden max-h-48 overflow-y-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-muted text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th class="px-3 py-2">Name</th>
                    <th class="px-3 py-2">Emp/Eenggas No</th>
                    <th class="px-3 py-2">Office</th>
                    <th class="px-3 py-2">Account No</th>
                    <th class="px-3 py-2">Emp Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="(row, idx) in parsedRows" :key="idx" class="hover:bg-muted/50">
                    <td class="px-3 py-2 font-medium">{{ row.name }}</td>
                    <td class="px-3 py-2 font-mono">
                      {{ row.employee_no }} / {{ row.eenggas_no }}
                    </td>
                    <td class="px-3 py-2">{{ row.office_code }}</td>
                    <td class="px-3 py-2 font-mono">{{ row.account_no }}</td>
                    <td class="px-3 py-2">{{ row.employment_status }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <SheetFooter class="gap-2">
        <SheetClose as-child>
          <Button variant="outline" @click="close">Cancel</Button>
        </SheetClose>
        <Button :disabled="parsedRows.length === 0" @click="handleImportSubmit">
          Import ({{ parsedRows.length }} rows)
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
