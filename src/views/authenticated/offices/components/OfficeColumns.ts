import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Office } from '@/types/office.types'
import ColumnHeader from '@/components/ui/custom/data-table/ColumnHeader.vue'
import { formatDate } from '@/helpers/date.helper'
import DataTableRowActions from './DataTableRowActions.vue'

export const officeColumns: ColumnDef<Office>[] = [
  {
    accessorKey: 'office_code',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Office Code' }),
    cell: ({ row }) => h('div', { class: 'font-semibold' }, row.getValue('office_code')),
    enableHiding: false,
  },
  {
    accessorKey: 'office_name',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Office Name' }),
    meta: {
      className: 'w-full',
    },
    cell: ({ row }) => h('div', { class: 'font-semibold truncate' }, row.getValue('office_name')),
  },
  {
    accessorKey: 'abbreviation',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Abbreviation' }),
    cell: ({ row }) => h('div', { class: 'font-semibold' }, row.getValue('abbreviation') || '-'),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Status' }),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusMap: Record<string, { text: string; color: string }> = {
        active: { text: 'Active', color: 'bg-green-100 text-green-800' },
        inactive: { text: 'Inactive', color: 'bg-red-100 text-red-800' },
      }
      const { text, color } = statusMap[status] || {
        text: 'Unknown',
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
        onEdit: (data: Office) => (table.options.meta as any)?.onEdit?.(data),
        onDelete: (data: Office) => (table.options.meta as any)?.onDelete?.(data),
      }),
  },
]
