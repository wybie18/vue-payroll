import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Employee } from '@/types/employee.types'
import ColumnHeader from '@/components/ui/custom/data-table/ColumnHeader.vue'
import { formatDate } from '@/helpers/date.helper'
import DataTableRowActions from './DataTableRowActions.vue'

export const employeeColumns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'employee_no',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Employee No' }),
    cell: ({ row }) => h('div', { class: 'font-semibold' }, row.getValue('employee_no')),
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Name' }),
    meta: {
      className: 'w-full',
    },
    cell: ({ row }) => h('div', { class: 'font-semibold truncate' }, row.getValue('name')),
  },
  {
    accessorKey: 'eenggas_no',
    header: ({ column }) => h(ColumnHeader, { column, title: 'EENGGAS No' }),
    cell: ({ row }) => h('div', { class: 'font-semibold' }, row.getValue('eenggas_no')),
  },
  {
    accessorKey: 'account_no',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Account No' }),
    cell: ({ row }) => h('div', { class: 'font-semibold' }, row.getValue('account_no')),
  },
  {
    accessorKey: 'employment_status',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Employment Status' }),
    cell: ({ row }) =>
      h('div', { class: 'font-semibold' }, row.getValue('employment_status') || 'N/A'),
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
      const { text, color } = statusMap[status?.toLowerCase()] || {
        text: status || 'Unknown',
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
        onEdit: (data: Employee) => (table.options.meta as any)?.onEdit?.(data),
        onDelete: (data: Employee) => (table.options.meta as any)?.onDelete?.(data),
      }),
  },
]
