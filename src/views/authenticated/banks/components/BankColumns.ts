import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Bank } from '@/types/bank.types'
import ColumnHeader from '@/components/ui/custom/data-table/ColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'

export const bankColumns: ColumnDef<Bank>[] = [
  {
    accessorKey: 'bank_id',
    header: '#',
    cell: ({ row }) => h('div', { class: 'font-semibold' }, row.getValue('bank_id')),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'bank_name',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Bank Name' }),
    meta: {
      className: 'w-full',
    },
    cell: ({ row }) => h('div', { class: 'font-semibold truncate' }, row.getValue('bank_name')),
  },
  {
    accessorKey: 'bank_abbreviation',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Abbreviation' }),
    cell: ({ row }) => h('div', { class: 'font-semibold' }, row.getValue('bank_abbreviation') || '-'),
  },
  {
    accessorKey: 'branch_name',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Branch Name' }),
    cell: ({ row }) => h('div', { class: 'font-semibold' }, row.getValue('branch_name') || '-'),
  },
  {
    accessorKey: 'address',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Address' }),
    cell: ({ row }) => h('div', { class: 'truncate max-w-xs' }, row.getValue('address') || '-'),
  },
  {
    id: 'actions',
    meta: { className: 'w-[50px]' },
    cell: ({ row, table }) =>
      h(DataTableRowActions, {
        row,
        onEdit: (data: Bank) => (table.options.meta as any)?.onEdit?.(data),
        onDelete: (data: Bank) => (table.options.meta as any)?.onDelete?.(data),
      }),
  },
]
