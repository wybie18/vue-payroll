import { computed, type Ref } from 'vue'
import {
  ADA_BANK_ACTIONS,
  parseBankAbbr,
  type AdaBankActionType,
  type AdaBankActionGroup,
} from '@/config/ada-bank-actions.config'
import { useAdaExport } from '@/composables/payroll/useAdaExport'
import { useAdaCsvExport } from '@/composables/payroll/useAdaCsvExport'
import { useAdaPrint } from '@/composables/payroll/useAdaPrint'
import type { AdaDetails } from '@/types/payroll-ada-batch.types'
import type { PrintMode } from '@/composables/payroll/useAdaPrint'

export function useAdaBankActions(adaId: Ref<number | null>, adaNumber: Ref<string>) {
  // ── Parse bank from ADA number ─────────────────────────────────────────────
  const bankAbbr = computed(() => parseBankAbbr(adaNumber.value))

  /** Action groups for the current bank, or empty if bank is not configured. */
  const actionGroups = computed<AdaBankActionGroup[]>(
    () => ADA_BANK_ACTIONS[bankAbbr.value] ?? [],
  )

  /** True when at least one action is configured for this bank. */
  const hasActions = computed(() => actionGroups.value.length > 0)

  // ── Sub-composables ────────────────────────────────────────────────────────
  const { isExporting: isExportingTxt, exportToText } = useAdaExport(adaId, adaNumber)
  const { isExporting: isExportingCsv, exportToCsv } = useAdaCsvExport(adaId, adaNumber)
  const { isPrinting, printData, printMode, printProoflist, printAdaForm } = useAdaPrint(adaId)

  /** True while any async action is in-flight. */
  const isBusy = computed(
    () => isExportingTxt.value || isExportingCsv.value || isPrinting.value,
  )

  // ── Action dispatcher ──────────────────────────────────────────────────────
  /**
   * Dispatches the correct handler for a given action type.
   * To support a new action type: add the case here and in ada-bank-actions.config.ts.
   */
  async function handleAction(type: AdaBankActionType): Promise<void> {
    switch (type) {
      case 'export-txt':
        return exportToText()
      case 'export-csv':
        return exportToCsv()
      case 'print-prooflist':
        return printProoflist()
      case 'print-ada':
        return printAdaForm()
    }
  }

  return {
    bankAbbr,
    actionGroups,
    hasActions,
    isBusy,
    handleAction,
    // Expose print state so Index.vue can mount the Teleport components
    printData: printData as Ref<AdaDetails | null>,
    printMode: printMode as Ref<PrintMode>,
  }
}
