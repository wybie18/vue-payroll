import { ref, type Ref } from 'vue'
import { getAdaDetails } from '@/services/payroll-ada-batch.service'
import { formatCurrency, formatAccountNo, formatName } from '@/helpers/format.helper'
import { toast } from 'vue-sonner'

// ─── CSV builder ──────────────────────────────────────────────────────────────

function escapeCsvCell(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildCsvContent(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
}

function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useAdaCsvExport(adaId: Ref<number | null>, adaNumber: Ref<string>) {
  const isExporting = ref(false)

  async function exportToCsv(): Promise<void> {
    if (!adaId.value) {
      toast.warning('No ADA selected for export.')
      return
    }

    isExporting.value = true

    const { data, error } = await getAdaDetails(adaId.value)

    if (error || !data) {
      console.error('[useAdaCsvExport] export:', error?.message)
      toast.error('Export failed', {
        description: 'Unable to retrieve ADA details. Please try again.',
      })
      isExporting.value = false
      return
    }

    const rows: (string | number)[][] = [
      ['Account Number', 'Name', 'Amount'],
      // Employee rows
      ...data.employees.map((emp) => [
        formatAccountNo(emp.account_no),
        formatName(emp.name),
        formatCurrency(emp.net_pay).replace(/[,.]/g, ''),
      ]),
    ]

    const content = buildCsvContent(rows)
    const bankAccountSource = data.bank_account.bank_abbreviation + data.bank_account.fund_source
    const totalNetPay = data.total_net_pay
    const filename = `PAY${data.ada_date.split('-').slice(1).join('')}_${bankAccountSource}_${totalNetPay}.csv`
    triggerDownload(content, filename)

    toast.success('Export successful', {
      description: `${filename} has been downloaded.`,
    })

    isExporting.value = false
  }

  return {
    isExporting,
    exportToCsv,
  }
}
