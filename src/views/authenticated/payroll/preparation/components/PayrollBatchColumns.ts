import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { PayrollBatchWithRelations } from '@/types/payroll-batch.types'
import ColumnHeader from '@/components/ui/custom/data-table/ColumnHeader.vue'
import { formatDate } from '@/helpers/date.helper'
import DataTableRowActions from './DataTableRowActions.vue'

export const payrollBatchColumns: ColumnDef<PayrollBatchWithRelations>[] = [
  {
    accessorKey: 'batch_code',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Batch Code' }),
    meta: {
      className: 'w-full',
    },
    cell: ({ row, table }) =>
      h(
        'div',
        {
          class: 'font-semibold cursor-pointer hover:underline text-primary',
          onClick: () => (table.options.meta as any)?.onShowEmployeePayroll?.(row.original),
        },
        row.getValue('batch_code') as string,
      ),
    enableHiding: false,
  },
  {
    accessorKey: 'period',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Period' }),
    cell: ({ row }) => {
      const period = row.original.period
      const displayText = period
        ? `${formatDate(period.cutoff_start)} - ${formatDate(period.cutoff_end)}`
        : 'N/A'
      return h('div', { class: 'font-semibold text-muted-foreground' }, displayText)
    },
  },
  {
    accessorKey: 'fund_source',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Fund Source' }),
    cell: ({ row }) => {
      const bankAbbreviation = row.original.bank_abbreviation
      const fundSource = row.getValue('fund_source') as string | null
      const displayText = fundSource
        ? `${bankAbbreviation ? `${bankAbbreviation}-${fundSource}` : ''}`
        : 'N/A'
      return h('div', { class: 'font-semibold text-muted-foreground' }, displayText)
    },
  },
  {
    accessorKey: 'total_employees',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Total Employees' }),
    cell: ({ row }) =>
      h('div', { class: 'text-center text-muted-foreground' }, row.getValue('total_employees')),
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
        draft: { text: 'Draft', color: 'bg-slate-100 text-slate-800' },
        added: { text: 'Added', color: 'bg-green-100 text-green-800' },
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
        onShow: (data: PayrollBatchWithRelations) =>
          (table.options.meta as any)?.onShowEmployeePayroll?.(data),
        onEdit: (data: PayrollBatchWithRelations) => (table.options.meta as any)?.onEdit?.(data),
        onDelete: (data: PayrollBatchWithRelations) =>
          (table.options.meta as any)?.onDelete?.(data),
      }),
  },
]
