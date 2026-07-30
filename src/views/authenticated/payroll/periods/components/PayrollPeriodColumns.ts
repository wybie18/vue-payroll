import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { PayrollPeriod } from '@/types/payroll-period.types'
import ColumnHeader from '@/components/ui/custom/data-table/ColumnHeader.vue'
import { formatDate } from '@/helpers/date.helper'
import DataTableRowActions from './DataTableRowActions.vue'
import CompensationBadge from '@/components/ui/custom/CompensationBadge.vue'

export const payrollPeriodColumns: ColumnDef<PayrollPeriod>[] = [
  {
    accessorKey: 'cutoff_start',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Cutoff Start' }),
    cell: ({ row }) =>
      h('div', { class: 'font-semibold' }, formatDate(row.getValue('cutoff_start'))),
  },
  {
    accessorKey: 'cutoff_end',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Cutoff End' }),
    cell: ({ row }) => h('div', { class: 'font-semibold' }, formatDate(row.getValue('cutoff_end'))),
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
        ? h('div', { class: 'truncate max-w-[300px]', title: desc }, desc)
        : h('span', { class: 'text-muted-foreground' }, '—')
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
