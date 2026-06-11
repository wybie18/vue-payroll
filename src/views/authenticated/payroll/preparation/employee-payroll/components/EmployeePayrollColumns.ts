import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { EmployeePayrollWithEmployee } from '@/types/employee-payroll.types'
import ColumnHeader from '@/components/ui/custom/data-table/ColumnHeader.vue'
import { formatDate } from '@/helpers/date.helper'
import DataTableRowActions from './DataTableRowActions.vue'

export const employeePayrollColumns: ColumnDef<EmployeePayrollWithEmployee>[] = [
  {
    accessorKey: 'employee_name',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Employee Name' }),
    meta: {
      className: 'w-full',
    },
    cell: ({ row }) =>
      h(
        'div',
        { class: 'font-semibold truncate' },
        row.original.employee?.name || 'Unknown Employee',
      ),
    enableHiding: false,
  },
  {
    accessorKey: 'account_no',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Account No' }),
    cell: ({ row }) =>
      h('div', { class: 'font-medium text-center' }, row.getValue('account_no') || '-'),
  },
  {
    accessorKey: 'net_pay',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Net Pay' }),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('net_pay'))
      const formatted = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(amount)
      return h('div', { class: 'font-medium text-center' }, formatted)
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Created At' }),
    meta: {
      className: 'w-[150px] text-right',
    },
    cell: ({ row }) => formatDate(row.getValue('created_at')),
  },
  {
    id: 'actions',
    meta: { className: 'w-[50px]' },
    cell: ({ row, table }) =>
      h(DataTableRowActions, {
        row,
        onEdit: (data: EmployeePayrollWithEmployee) => (table.options.meta as any)?.onEdit?.(data),
        onDelete: (data: EmployeePayrollWithEmployee) =>
          (table.options.meta as any)?.onDelete?.(data),
      }),
  },
]
