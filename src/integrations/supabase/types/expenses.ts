
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
    currency: string
    exchange_rate: number
    original_amount: number
    isReturn?: boolean // Note: This is for UI only, not stored in DB
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
    currency: string
    exchange_rate: number
    original_amount: number
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
    currency?: string
    exchange_rate?: number
    original_amount?: number
  }
}
