import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { AccountWithBank } from '@/types/bank.types'
import ColumnHeader from '@/components/ui/custom/data-table/ColumnHeader.vue'
import DataTableRowActions from './DataTableRowActions.vue'

export const bankAccountColumns: ColumnDef<AccountWithBank>[] = [
  {
    accessorKey: 'bank_account_id',
    header: '#',
    cell: ({ row }) => h('div', { class: 'font-semibold' }, row.getValue('bank_account_id')),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'bank_name',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Bank' }),
    cell: ({ row }) => h('div', { class: 'font-semibold' }, row.getValue('bank_name')),
  },
  {
    accessorKey: 'account_number',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Account Number' }),
    meta: {
      className: 'w-full',
    },
    cell: ({ row }) =>
      h('div', { class: 'font-semibold truncate' }, row.getValue('account_number')),
  },
  {
    accessorKey: 'fund_source',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Fund Source' }),
    cell: ({ row }) => h('div', { class: 'font-semibold' }, row.getValue('fund_source')),
  },
  {
    id: 'actions',
    meta: { className: 'w-[50px]' },
    cell: ({ row, table }) =>
      h(DataTableRowActions, {
        row,
        onEdit: (data: AccountWithBank) => (table.options.meta as any)?.onEdit?.(data),
        onDelete: (data: AccountWithBank) => (table.options.meta as any)?.onDelete?.(data),
      }),
  },
]
