import type { PostgrestError } from "@supabase/supabase-js"

export interface ServiceResponse<T = null> {
  data: T
  error: PostgrestError | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  error: PostgrestError | null
}
