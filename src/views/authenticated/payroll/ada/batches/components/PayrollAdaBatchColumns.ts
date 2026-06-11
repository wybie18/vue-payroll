import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { PayrollAdaBatchWithRelations } from '@/types/payroll-ada-batch.types'
import ColumnHeader from '@/components/ui/custom/data-table/ColumnHeader.vue'
import { formatDate } from '@/helpers/date.helper'
import DataTableRowActions from './DataTableRowActions.vue'

export const payrollAdaBatchColumns: ColumnDef<PayrollAdaBatchWithRelations>[] = [
  {
    id: 'batch_code',
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
        row.original.batch_code,
      ),
    enableHiding: false,
  },
  {
    id: 'period',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Period' }),
    cell: ({ row }) => {
      const start = row.original.cutoff_start
      const end = row.original.cutoff_end
      const displayText = start && end ? `${formatDate(start)} - ${formatDate(end)}` : 'N/A'
      return h('div', { class: 'font-semibold text-muted-foreground' }, displayText)
    },
  },
  {
    id: 'fund_source',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Fund Source' }),
    cell: ({ row }) => {
      const bankAbbreviation = row.original.bank_abbreviation
      const fundSource = row.original.fund_source
      const displayText = bankAbbreviation ? `${bankAbbreviation}-${fundSource}` : 'N/A'
      return h('div', { class: 'font-semibold text-muted-foreground' }, displayText)
    },
  },
  {
    accessorKey: 'total_employees',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Total Employees' }),
    cell: ({ row }) =>
      h('div', { class: 'text-center text-muted-foreground' }, row.original.total_employees),
  },
  {
    accessorKey: 'total_net_pay',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Total Net Pay' }),
    cell: ({ row }) => {
      const value = row.original.total_net_pay
      return h(
        'div',
        { class: 'text-center text-muted-foreground' },
        value.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }),
      )
    },
  },
  {
    accessorKey: 'batch_status',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Status' }),
    cell: ({ row }) => {
      const status = row.original.batch_status
      const statusMap: Record<string, { text: string; color: string }> = {
        pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        processing: { text: 'Processing', color: 'bg-blue-100 text-blue-800' },
        completed: { text: 'Completed', color: 'bg-green-100 text-green-800' },
        error: { text: 'Error', color: 'bg-red-100 text-red-800' },
      }
      const { text, color } = statusMap[status?.toLowerCase()] || {
        text: status,
        color: 'bg-gray-100 text-gray-800',
      }
      return h('span', { class: `px-2 py-1 rounded-full text-xs font-medium ${color}` }, text)
    },
  },
  {
    id: 'actions',
    meta: { className: 'w-[50px]' },
    cell: ({ row, table }) =>
      h(DataTableRowActions, {
        row,
        onShow: (data: PayrollAdaBatchWithRelations) =>
          (table.options.meta as any)?.onShowEmployeePayroll?.(data),
        onDelete: (data: PayrollAdaBatchWithRelations) =>
          (table.options.meta as any)?.onDelete?.(data),
      }),
  },
]
