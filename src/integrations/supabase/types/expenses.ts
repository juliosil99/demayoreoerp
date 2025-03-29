
export interface ExpensesTable {
  Row: {
    id: string
    created_at: string
    user_id: string
    date: string
    description: string
    amount: number
    account_id: number
    chart_account_id: string
    payment_method: string
    reference_number: string | null
    notes: string | null
    supplier_id: string | null
    category: string | null
    reconciled: boolean | null
    reconciliation_date: string | null
    reconciliation_type: string | null
  }
  Insert: {
    id?: string
    created_at?: string
    user_id: string
    date: string
    description: string
    amount: number
    account_id: number
    chart_account_id: string
    payment_method: string
    reference_number?: string | null
    notes?: string | null
    supplier_id?: string | null
    category?: string | null
    reconciled?: boolean | null
    reconciliation_date?: string | null
    reconciliation_type?: string | null
  }
  Update: {
    id?: string
    created_at?: string
    user_id?: string
    date?: string
    description?: string
    amount?: number
    account_id?: number
    chart_account_id?: string
    payment_method?: string
    reference_number?: string | null
    notes?: string | null
    supplier_id?: string | null
    category?: string | null
    reconciled?: boolean | null
    reconciliation_date?: string | null
    reconciliation_type?: string | null
  }
}
