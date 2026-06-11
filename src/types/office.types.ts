export interface Office {
  office_id: number
  office_code: string
  office_name: string
  abbreviation: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface ListOfficesParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string | null
}
