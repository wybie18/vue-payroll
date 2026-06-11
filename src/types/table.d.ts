import '@tanstack/vue-table'

declare module '@tanstack/vue-table' {
  interface ColumnMeta<TData, TValue> {
    className?: string
    thClassName?: string
    tdClassName?: string
  }
}
