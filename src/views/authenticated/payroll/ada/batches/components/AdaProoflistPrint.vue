<script setup lang="ts">
import type { AdaDetails } from '@/types/payroll-ada-batch.types'
import { formatAccountNo, formatCurrency, formatName } from '@/helpers/format.helper'
import logoUrl from '@/assets/images/logo/sfads-logo.png'
import GovHeader from '@/components/ui/custom/print/GovHeader.vue'

defineProps<{
  data: AdaDetails
}>()
</script>

<template>
  <div class="ada-print-root">
    <GovHeader />

    <!-- Document Title -->
    <div class="doc-title">
      <strong
        >Payroll Prooflist for {{ data.period.cutoff_start }} to
        {{ data.period.cutoff_end }}</strong
      >
    </div>

    <!-- Employee Table -->
    <table>
      <thead>
        <tr>
          <th>Account Number</th>
          <th>Name</th>
          <th class="col-amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="emp in data.employees" :key="emp.account_no">
          <td>{{ formatAccountNo(emp.account_no) }}</td>
          <td>{{ formatName(emp.name) }}</td>
          <td class="col-amount">{{ formatCurrency(emp.net_pay) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td></td>
          <td><strong>TOTAL</strong></td>
          <td class="col-amount">
            <strong>{{ formatCurrency(data.total_net_pay) }}</strong>
          </td>
        </tr>
      </tfoot>
    </table>
    <div class="mt-8 text-sm text-center">*** NOTHING FOLLOWS ***</div>

    <footer class="fixed bottom-0 left-0 right-0 pb-16 text-sm text-center flex flex-col gap-1">
      <span>This is a system generate report.</span>
      <span>{{ new Date().toLocaleString() }}</span>
    </footer>
  </div>
</template>

<style scoped>
/* ── Screen: hide entirely — only visible via @media print in useAdaPrint injection ── */
.ada-print-root {
  display: none;
}

.doc-title {
  text-align: center;
  margin-bottom: 20px;
  font-family: Arial, sans-serif;
}

.doc-title strong {
  font-size: 12pt;
  display: block;
  margin-bottom: 4px;
}

.doc-subtitle {
  font-size: 10pt;
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
  border-top: 3px double #000;
  border-bottom: 3px double #000;
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
