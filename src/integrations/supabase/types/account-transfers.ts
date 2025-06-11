
export interface AccountTransfersTable {
  Row: {
    id: string
    created_at: string | null
    date: string
    from_account_id: number
    to_account_id: number
    amount_from: number
    amount_to: number
    exchange_rate: number | null
    reference_number: string | null
    notes: string | null
    user_id: string
    status: string
    company_id: string
  }
  Insert: {
    id?: string
    created_at?: string | null
    date: string
    from_account_id: number
    to_account_id: number
    amount_from: number
    amount_to: number
    exchange_rate?: number | null
    reference_number?: string | null
    notes?: string | null
    user_id: string
    status?: string
    company_id: string
  }
  Update: {
    id?: string
    created_at?: string | null
    date?: string
    from_account_id?: number
    to_account_id?: number
    amount_from?: number
    amount_to?: number
    exchange_rate?: number | null
    reference_number?: string | null
    notes?: string | null
    user_id?: string
    status?: string
    company_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "account_transfers_from_account_id_fkey"
      columns: ["from_account_id"]
      isOneToOne: false
      referencedRelation: "bank_accounts"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "account_transfers_to_account_id_fkey"
      columns: ["to_account_id"]
      isOneToOne: false
      referencedRelation: "bank_accounts"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "account_transfers_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "account_transfers_company_id_fkey"
      columns: ["company_id"]
      isOneToOne: false
      referencedRelation: "companies"
      referencedColumns: ["id"]
    }
  ]
}
