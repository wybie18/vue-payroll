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
import { Clipboard, Download, AlertTriangle } from '@lucide/vue'
import { useEmployees } from '@/composables/employees/useEmployees'
import FileDropzone from '@/components/ui/custom/FileDropzone.vue'
import Papa from 'papaparse'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [
    payload: {
      employee_id: number
      account_no: string
      net_pay: number
      bank_account_id: number | null
    }[],
  ]
}>()

const { allEmployees, fetchAllEmployees } = useEmployees()

onMounted(async () => {
  await fetchAllEmployees()
})

const activeTab = ref('upload')
const pastedText = ref('')
const selectedFileName = ref('')

interface ParsedRow {
  employee_id: number
  eenggas_no: string
  name: string
  account_no: string
  net_pay: number
  bank_account_id: number | null
}

const parsedRows = ref<ParsedRow[]>([])
const validationErrors = ref<string[]>([])

const downloadTemplate = () => {
  const csvContent =
    'eenggas no,employee name,net amount\nEEG-0001,John Doe,12500.50\nEEG-0002,Jane Smith,18200.00'
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'employee_payroll_import_template.csv')
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
    const thirdCol = row[2]?.replace(/[$,]/g, '').trim() || ''

    // Detect header row and skip
    if (
      index === 0 &&
      (firstCol.toLowerCase().includes('eenggas') ||
        firstCol.toLowerCase().includes('employee') ||
        isNaN(Number(thirdCol)))
    ) {
      return
    }

    if (row.length < 3) {
      tempErrors.push(
        `Row ${index + 1}: Expected 3 columns (eenggas no, name, net amount), got ${row.length}`,
      )
      return
    }

    const eenggasNo = row[0]?.trim()
    const netPayStr = row[2]?.replace(/[$,]/g, '').trim()
    const netPay = Number(netPayStr)

    if (!eenggasNo) {
      tempErrors.push(`Row ${index + 1}: Eenggas No is empty`)
      return
    }

    if (isNaN(netPay)) {
      tempErrors.push(`Row ${index + 1}: Invalid net amount "${netPayStr}"`)
      return
    }

    const employee = allEmployees.value.find(
      (e) => String(e.eenggas_no).trim().toLowerCase() === eenggasNo.toLowerCase(),
    )

    if (!employee) {
      tempErrors.push(
        `Row ${index + 1}: Employee with Eenggas No "${eenggasNo}" not found in system`,
      )
      return
    }

    tempRows.push({
      employee_id: employee.id,
      eenggas_no: employee.eenggas_no,
      name: employee.name,
      account_no: employee.account_no || '',
      net_pay: netPay,
      bank_account_id: employee.bank_account_id || null,
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
    employee_id: row.employee_id,
    account_no: row.account_no,
    net_pay: row.net_pay,
    bank_account_id: row.bank_account_id,
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
        <SheetTitle>Import Employee Payroll</SheetTitle>
        <SheetDescription>
          Import bulk employee payroll rows using a CSV file or direct text input.
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
            <p>Your import should contain exactly 3 columns in the following order:</p>
            <code class="block bg-muted p-2 rounded-md font-mono text-foreground mt-1">
              eenggas no, employee name, net amount<br />
              EEG-0001, Juan Dela Cruz, 15000.50<br />
              EEG-0002, Maria Santos, 22400.00
            </code>
          </div>
        </div>

        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="upload" class="gap-1.5">
              <FileUp :size="15" />
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
              <Label for="csv-text">Paste Text Block</Label>
              <Textarea
                id="csv-text"
                v-model="pastedText"
                placeholder="EEG-0001, John Doe, 12500.50&#10;EEG-0002, Jane Smith, 18200.00"
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
            <h4 class="text-sm font-semibold text-foreground">Preview ({{ parsedRows.length }})</h4>
            <div class="border rounded-md overflow-hidden max-h-48 overflow-y-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-muted text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th class="px-3 py-2">Eenggas No</th>
                    <th class="px-3 py-2">Employee Name</th>
                    <th class="px-3 py-2 text-right">Net Pay</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="(row, idx) in parsedRows" :key="idx" class="hover:bg-muted/50">
                    <td class="px-3 py-2 font-mono">{{ row.eenggas_no }}</td>
                    <td class="px-3 py-2">{{ row.name }}</td>
                    <td class="px-3 py-2 text-right font-mono font-medium">
                      {{
                        row.net_pay.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })
                      }}
                    </td>
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
