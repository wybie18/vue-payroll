import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { PayrollPeriod } from '@/types/payroll-period.types'
import ColumnHeader from '@/components/ui/custom/data-table/ColumnHeader.vue'
import { formatDate } from '@/helpers/date.helper'
import DataTableRowActions from './DataTableRowActions.vue'

export const payrollPeriodColumns: ColumnDef<PayrollPeriod>[] = [
  {
    accessorKey: 'payroll_period_id',
    header: '#',
    cell: ({ row }) => h('div', { class: 'font-semibold' }, row.getValue('payroll_period_id')),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'cutoff_start',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Cutoff Start' }),
    meta: {
      className: 'w-full',
    },
    cell: ({ row }) => h('div', { class: 'font-semibold' }, formatDate(row.getValue('cutoff_start'))),
  },
  {
    accessorKey: 'cutoff_end',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Cutoff End' }),
    cell: ({ row }) => h('div', { class: 'font-semibold' }, formatDate(row.getValue('cutoff_end'))),
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
        onEdit: (data: PayrollPeriod) => (table.options.meta as any)?.onEdit?.(data),
        onDelete: (data: PayrollPeriod) => (table.options.meta as any)?.onDelete?.(data),
      }),
  },
]
