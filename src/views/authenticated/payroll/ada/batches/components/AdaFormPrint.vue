<script setup lang="ts">
import { computed } from 'vue'
import type { AdaDetails } from '@/types/payroll-ada-batch.types'
import { formatCurrency, formatName } from '@/helpers/format.helper'
import { amountToWords } from '@/helpers/amount-to-words.helper'
import logoUrl from '@/assets/images/logo/sfads-logo.png'
import GovHeader from '@/components/ui/custom/print/GovHeader.vue'

const props = defineProps<{
  data: AdaDetails
}>()

const accountDisplay = computed(
  () => `${props.data.bank_account.account_number}(${props.data.bank_account.fund_source})`,
)

const amountWords = computed(() => amountToWords(props.data.total_net_pay))
</script>

<template>
  <div class="ada-print-root">
    <!-- Government Header -->
    <GovHeader />

    <!-- Document Title -->
    <div class="doc-title">
      <strong>AUTHORITY TO DEBIT ACCOUNT (ADA)</strong>
    </div>

    <!-- ADA Meta -->
    <table class="meta-table">
      <tbody>
        <tr>
          <td class="col-left">SAN FRANCISCO, AGUSAN DEL SUR</td>
          <td class="col-right">
            ADA No.:&nbsp;<strong>{{ data.ada_number }}</strong>
          </td>
        </tr>
        <tr>
          <td>LGU SAN FRANCISCO</td>
          <td class="col-right">
            Date:&nbsp;<strong>{{ data.ada_date }}</strong>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Salutation + Body -->
    <p class="salutation">Sir/Madam:</p>
    <p class="body-text">
      Please debit the agency Account No. <strong>{{ accountDisplay }}</strong> the amount of
      <strong>{{ amountWords }} ONLY (PHP {{ formatCurrency(data.total_net_pay) }})</strong>. Please
      credit the accounts of the listed creditors to cover payment of payables.
    </p>

    <!-- Batch Table -->
    <table>
      <thead>
        <tr>
          <th>Office/Department/Payee</th>
          <th>Reference</th>
          <th class="col-amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="batch in data.batches" :key="batch.batch_id">
          <td>
            {{ batch.employees[0]?.name ?? '—' }}
            <span v-if="batch.employees.length > 1">, et.al</span>
          </td>
          <td>{{ batch.batch_code }}</td>
          <td class="col-amount">{{ formatCurrency(batch.total_net_pay) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="2"><strong>TOTAL</strong></td>
          <td class="col-amount">
            <strong>{{ formatCurrency(data.total_net_pay) }}</strong>
          </td>
        </tr>
      </tfoot>
    </table>
    <div class="mt-8 text-[10pt]">
      <p class="font-bold mb-8">AGENCY AUTHORIZED SIGNATORIES:</p>
      <div class="flex gap-10">
        <div class="min-w-50 text-center">
          <p class="font-bold m-0 border-b border-black">GRACE CARMEL D. PAREDES-BRAVO</p>
          <p class="text-[9pt] m-0">Municipal Mayor</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Screen: hide entirely ── */
.ada-print-root {
  display: none;
}

.doc-title {
  text-align: center;
  margin-bottom: 20px;
}

.doc-title strong {
  font-family: Arial, sans-serif;
  font-size: 12pt;
}

.meta-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  font-size: 10pt;
}

.meta-table td {
  padding: 2px 0;
}

.col-left {
  width: 55%;
}

.col-right {
  text-align: right;
}

.salutation {
  font-size: 10pt;
  margin-bottom: 12px;
}

.body-text {
  font-size: 10pt;
  text-indent: 2em;
  line-height: 1.7;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 5px 8px;
  font-size: 10pt;
}

th {
  border-top: 1.5px solid #000;
  border-bottom: 1.5px solid #000;
  text-align: left;
}

.col-amount {
  text-align: right;
}

.total-row td {
  border-top: 1.5px solid #000;
  padding-top: 6px;
}
</style>
