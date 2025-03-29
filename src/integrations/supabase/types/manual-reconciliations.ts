
export interface ManualReconciliationsTable {
  Row: {
    id: string
    expense_id: string
    user_id: string
    reconciliation_type: string
    reference_number: string | null
    notes: string
    file_id: string | null
    chart_account_id: string | null
    created_at: string
  }
  Insert: {
    id?: string
    expense_id: string
    user_id: string
    reconciliation_type: string
    reference_number?: string | null
    notes: string
    file_id?: string | null
    chart_account_id?: string | null
    created_at?: string
  }
  Update: {
    id?: string
    expense_id?: string
    user_id?: string
    reconciliation_type?: string
    reference_number?: string | null
    notes?: string
    file_id?: string | null
    chart_account_id?: string | null
    created_at?: string
  }
}

export interface ManualInvoiceFilesTable {
  Row: {
    id: string
    filename: string
    file_path: string
    content_type: string
    size: number
    user_id: string
    created_at: string
  }
  Insert: {
    id?: string
    filename: string
    file_path: string
    content_type: string
    size: number
    user_id: string
    created_at?: string
  }
  Update: {
    id?: string
    filename?: string
    file_path?: string
    content_type?: string
    size?: number
    user_id?: string
    created_at?: string
  }
}
