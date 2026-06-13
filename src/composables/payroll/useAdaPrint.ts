import { ref, nextTick, type Ref } from 'vue'
import { getAdaDetails } from '@/services/payroll-ada-batch.service'
import type { AdaDetails } from '@/types/payroll-ada-batch.types'
import { toast } from 'vue-sonner'

// ─── Print isolation ──────────────────────────────────────────────────────────
// Injected into <head> just before window.print() so only .ada-print-root
// is visible on paper. Removed automatically on the afterprint event.

const PRINT_STYLE_ID = '__ada-print-isolation__'

function injectPrintStyles(): void {
  if (document.getElementById(PRINT_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = PRINT_STYLE_ID
  style.textContent = `
    @media print {
      body > *:not(.ada-print-root) { display: none !important; }
      body > .ada-print-root {
        display: block !important;
        width: 100%;
        padding: 18mm;
        font-family: Arial, sans-serif;
        font-size: 11pt;
        color: #000;
        background: #fff;
      }
      @page { margin: 0; }
    }
  `
  document.head.appendChild(style)
}

function removePrintStyles(): void {
  document.getElementById(PRINT_STYLE_ID)?.remove()
}

// ─── Composable ───────────────────────────────────────────────────────────────

export type PrintMode = 'prooflist' | 'ada' | null

export function useAdaPrint(adaId: Ref<number | null>) {
  const isPrinting = ref(false)
  const printData = ref<AdaDetails | null>(null)
  const printMode = ref<PrintMode>(null)

  async function _fetchAndPrint(mode: 'prooflist' | 'ada'): Promise<void> {
    if (!adaId.value) {
      toast.warning('No ADA selected.')
      return
    }

    isPrinting.value = true

    const { data, error } = await getAdaDetails(adaId.value)

    if (error || !data) {
      console.error('[useAdaPrint] fetch:', error?.message)
      toast.error('Print failed', {
        description: 'Unable to retrieve ADA details. Please try again.',
      })
      isPrinting.value = false
      return
    }

    // Set reactive state so the teleported print component mounts into <body>
    printData.value = data
    printMode.value = mode

    // Wait for Vue to flush the DOM so the component is present in <body>
    await nextTick()

    injectPrintStyles()

    window.addEventListener(
      'afterprint',
      () => {
        removePrintStyles()
        printMode.value = null
        printData.value = null
      },
      { once: true },
    )

    window.print()
    isPrinting.value = false
  }

  function printProoflist(): Promise<void> {
    return _fetchAndPrint('prooflist')
  }

  function printAdaForm(): Promise<void> {
    return _fetchAndPrint('ada')
  }

  return {
    isPrinting,
    printData,
    printMode,
    printProoflist,
    printAdaForm,
  }
}
