import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { PayrollAdaWithDetails } from '@/types/payroll-ada.types'
import ColumnHeader from '@/components/ui/custom/data-table/ColumnHeader.vue'
import { formatDate, formatDateRange } from '@/helpers/date.helper'
import DataTableRowActions from './DataTableRowActions.vue'
import CompensationBadge from '@/components/ui/custom/CompensationBadge.vue'

export const payrollAdaColumns: ColumnDef<PayrollAdaWithDetails>[] = [
  {
    accessorKey: 'ada_number',
    header: ({ column }) => h(ColumnHeader, { column, title: 'ADA Number' }),
    cell: ({ row, table }) =>
      h(
        'div',
        {
          class: 'font-semibold cursor-pointer hover:underline text-primary',
          onClick: () => (table.options.meta as any)?.onShowBatches?.(row.original),
        },
        row.getValue('ada_number') as string,
      ),
    enableHiding: false,
  },
  {
    accessorKey: 'period',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Period' }),
    cell: ({ row }) => {
      const period = row.original.period
      const displayText = period
        ? `${formatDateRange(period.cutoff_start, period.cutoff_end)}`
        : 'N/A'
      return h('div', { class: 'font-semibold text-muted-foreground' }, displayText)
    },
  },
  {
    accessorKey: 'compensation_type',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Compensation Type' }),
    cell: ({ row }) => {
      const type = row.getValue('compensation_type') as string | null
      if (!type) return h('span', { class: 'text-muted-foreground' }, '—')
      return h(CompensationBadge, { type })
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Description' }),
    meta: {
      className: 'w-full',
    },
    cell: ({ row }) => {
      const desc = row.getValue('description') as string | null
      return desc
        ? h('div', { class: 'truncate max-w-[250px]', title: desc }, desc)
        : h('span', { class: 'text-muted-foreground' }, '—')
    },
  },
  {
    accessorKey: 'fund_source',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Fund Source' }),
    cell: ({ row }) => {
      const fundSource = row.original.bank_account?.fund_source
      const bankAbbreviation = row.original.bank_account?.bank?.bank_abbreviation
      const displayText = fundSource
        ? bankAbbreviation
          ? `${bankAbbreviation}-${fundSource}`
          : `${fundSource}`
        : 'N/A'
      return h('div', { class: 'font-semibold text-muted-foreground' }, displayText)
    },
  },
  {
    accessorKey: 'total_batches',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Total Batches' }),
    cell: ({ row }) =>
      h('div', { class: 'text-center text-muted-foreground' }, row.getValue('total_batches')),
  },
  {
    accessorKey: 'total_net_pay',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Total Net Pay' }),
    cell: ({ row }) => {
      const value = row.getValue('total_net_pay') as number
      return h(
        'div',
        { class: 'text-center text-muted-foreground' },
        value.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }),
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Status' }),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusMap: Record<string, { text: string; color: string }> = {
        prepared: { text: 'Prepared', color: 'bg-blue-100 text-blue-800' },
        completed: { text: 'Completed', color: 'bg-green-100 text-green-800' },
      }
      const { text, color } = statusMap[status?.toLowerCase()] || {
        text: status,
        color: 'bg-gray-100 text-gray-800',
      }
      return h('span', { class: `px-2 py-1 rounded-full text-xs font-medium ${color}` }, text)
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Created At' }),
    meta: {
      className: 'w-[150px]',
    },
    cell: ({ row }) => formatDate(row.getValue('created_at')),
  },
  {
    id: 'actions',
    meta: { className: 'w-[50px]' },
    cell: ({ row, table }) =>
      h(DataTableRowActions, {
        row,
        onShow: (data: PayrollAdaWithDetails) => (table.options.meta as any)?.onShowBatches?.(data),
        onEdit: (data: PayrollAdaWithDetails) => (table.options.meta as any)?.onEdit?.(data),
        onDelete: (data: PayrollAdaWithDetails) => (table.options.meta as any)?.onDelete?.(data),
      }),
  },
]
