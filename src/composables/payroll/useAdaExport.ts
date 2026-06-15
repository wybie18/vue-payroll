import { ref, type Ref } from 'vue'
import { getAdaDetails } from '@/services/payroll-ada-batch.service'
import type { AdaDetails } from '@/types/payroll-ada-batch.types'
import { toast } from 'vue-sonner'
import { formatCurrency, formatName, formatAccountNo } from '@/helpers/format.helper'

function padRight(str: string, length: number): string {
  return str.padEnd(length, ' ')
}

function padLeft(str: string, length: number): string {
  return str.padStart(length, ' ')
}

function buildAdaTextContent(details: AdaDetails): string {
  const lines: string[] = []
  const nameColWidth = 60
  const amountColWidth = 13

  const headerText = formatAccountNo(details.bank_account.account_number) + 'LGU SAN FRANCISCO'
  const headerAmount = formatCurrency(details.total_net_pay).replace(/,/g, '')

  lines.push(`${padRight(headerText, nameColWidth)}${padLeft(headerAmount, amountColWidth)}`)

  for (const emp of details.employees) {
    const empAccountNo = formatAccountNo(emp.account_no)
    const empName = formatName(emp.name)
    const empAmount = formatCurrency(emp.net_pay).replace(/,/g, '')

    lines.push(
      `${padRight(empAccountNo + empName, nameColWidth)}${padLeft(empAmount, amountColWidth)}`,
    )
  }

  return lines.join('\n')
}

function triggerDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useAdaExport(adaId: Ref<number | null>, adaNumber: Ref<string>) {
  const isExporting = ref(false)

  async function exportToText(): Promise<void> {
    if (!adaId.value) {
      toast.warning('No ADA selected for export.')
      return
    }

    isExporting.value = true

    const { data, error } = await getAdaDetails(adaId.value)

    if (error || !data) {
      console.error('[useAdaExport] export:', error?.message)
      toast.error('Export failed', {
        description: 'Unable to retrieve ADA details. Please try again.',
      })
      isExporting.value = false
      return
    }

    const content = buildAdaTextContent(data)
    const bankAccountSource = data.bank_account.bank_abbreviation + data.bank_account.fund_source
    const totalNetPay = data.total_net_pay
    const filename = `PAY${data.ada_date.split('-').slice(1).join('')}_${bankAccountSource}_${totalNetPay}.txt`
    triggerDownload(content, filename)

    toast.success('Export successful', {
      description: `${filename} has been downloaded.`,
    })

    isExporting.value = false
  }

  return {
    isExporting,
    exportToText,
  }
}
