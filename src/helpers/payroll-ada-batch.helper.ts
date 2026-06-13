import type {
  AdaDetails,
  PayrollAdaBatch,
  PayrollAdaBatchWithRelations,
} from '@/types/payroll-ada-batch.types'

export function mapPayrollAdaBatch(row: any): PayrollAdaBatch {
  return {
    id: row.id,
    ada_id: row.ada_id,
    batch_id: row.batch_id ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  }
}

export function mapPayrollAdaBatchWithRelations(row: any): PayrollAdaBatchWithRelations {
  return {
    id: row.ada_batch_id,
    ada_id: row.ada_id,
    batch_id: row.batch_id,
    batch_code: row.batch_code ?? '',
    description: row.description ?? null,
    batch_status: row.batch_status ?? 'Pending',
    office_code: row.office_code ?? null,
    office_name: row.office_name ?? null,
    cutoff_start: row.cutoff_start ?? null,
    cutoff_end: row.cutoff_end ?? null,
    fund_source: row.fund_source ?? null,
    bank_abbreviation: row.bank_abbreviation ?? null,
    total_employees: row.total_employees ?? 0,
    total_net_pay: row.total_net_pay ?? 0,
    assigned_at: row.assigned_at ?? null,
  }
}

export function mapAdaDetails(row: any): AdaDetails {
  return {
    ada_number: row.ada_number ?? '',
    ada_date: row.ada_date ?? '',
    status: row.status ?? 'Pending',
    period: {
      payroll_period_id: row.period?.payroll_period_id ?? 0,
      cutoff_start: row.period?.cutoff_start ?? '',
      cutoff_end: row.period?.cutoff_end ?? '',
    },
    bank_account: {
      account_number: row.bank_account.account_number ?? '',
      bank_abbreviation: row.bank_account.bank_abbreviation ?? null,
      fund_source: row.bank_account.fund_source ?? '',
    },
    employees: (row.employees ?? []).map((emp: any) => ({
      name: emp.name ?? '',
      account_no: emp.account_no ?? '',
      net_pay: emp.net_pay ?? 0,
    })),
    batches: (row.batches ?? []).map((batch: any) => ({
      batch_id: batch.batch_id ?? 0,
      batch_code: batch.batch_code ?? '',
      total_net_pay: batch.total_net_pay ?? 0,
      employees: (batch.employees ?? []).map((emp: any) => ({
        name: emp.name ?? '',
        account_no: emp.account_no ?? '',
        net_pay: emp.net_pay ?? 0,
      })),
    })),
    total_net_pay: row.total_net_pay ?? 0,
  }
}
