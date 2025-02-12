
export interface AccountTransfersTable {
  Row: {
    id: string
    created_at: string | null
    date: string
    from_account_id: number
    to_account_id: number
    amount: number
    reference_number: string | null
    notes: string | null
    user_id: string
    status: string
  }
  Insert: {
    id?: string
    created_at?: string | null
    date: string
    from_account_id: number
    to_account_id: number
    amount: number
    reference_number?: string | null
    notes?: string | null
    user_id: string
    status?: string
  }
  Update: {
    id?: string
    created_at?: string | null
    date?: string
    from_account_id?: number
    to_account_id?: number
    amount?: number
    reference_number?: string | null
    notes?: string | null
    user_id?: string
    status?: string
  }
}
