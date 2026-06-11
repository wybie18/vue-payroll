import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { AuditLogWithProfile } from '@/types/audit-log.types'
import ColumnHeader from '@/components/ui/custom/data-table/ColumnHeader.vue'
import { formatDate } from '@/helpers/date.helper'
import DataTableRowActions from './DataTableRowActions.vue'

export const auditLogColumns: ColumnDef<AuditLogWithProfile>[] = [
  {
    accessorKey: 'table_name',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Table Name' }),
    cell: ({ row }) => {
      const val = row.getValue('table_name') as string
      // Format table name for readability (e.g. t_employee_payroll -> Employee Payroll)
      const formatted = val
        .replace(/^[l|t]_/, '')
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      return h('div', { class: 'font-semibold' }, formatted)
    },
    enableHiding: false,
  },
  {
    accessorKey: 'action',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Action' }),
    cell: ({ row }) => {
      const action = (row.getValue('action') as string).toUpperCase()
      const colorMap: Record<string, string> = {
        INSERT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        UPDATE: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        DELETE: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
      }
      const color = colorMap[action] || 'bg-slate-100 text-slate-800'
      return h(
        'span',
        { class: `px-2 py-1 rounded-full text-xs font-semibold ${color}` },
        action,
      )
    },
  },
  {
    id: 'changed_by',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Changed By' }),
    cell: ({ row }) => {
      const profile = row.original.profile
      if (profile) {
        const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
        return h('div', { class: 'flex flex-col' }, [
          h('span', { class: 'font-medium' }, name || 'User'),
          h('span', { class: 'text-xs text-muted-foreground' }, profile.email),
        ])
      }
      return h('span', { class: 'text-muted-foreground text-sm' }, row.original.changed_by || 'System')
    },
  },
  {
    accessorKey: 'changed_at',
    header: ({ column }) => h(ColumnHeader, { column, title: 'Timestamp' }),
    meta: {
      className: 'w-[180px]',
    },
    cell: ({ row }) => formatDate(row.getValue('changed_at')),
  },
  {
    id: 'actions',
    meta: { className: 'w-[50px]' },
    cell: ({ row, table }) =>
      h(DataTableRowActions, {
        row,
        onShow: (data: AuditLogWithProfile) => (table.options.meta as any)?.onShow?.(data),
      }),
  },
]
