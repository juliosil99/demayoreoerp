
export interface BankAccountsTable {
  Row: {
    id: number
    created_at: string | null
    name: string
    type: "Bank" | "Cash" | "Credit Card" | "Credit Simple"
    balance: number | null
    initial_balance: number | null
    balance_date: string | null
  }
  Insert: {
    id?: number
    created_at?: string | null
    name: string
    type: "Bank" | "Cash" | "Credit Card" | "Credit Simple"
    balance?: number | null
    initial_balance?: number | null
    balance_date?: string | null
  }
  Update: {
    id?: number
    created_at?: string | null
    name?: string
    type?: "Bank" | "Cash" | "Credit Card" | "Credit Simple"
    balance?: number | null
    initial_balance?: number | null
    balance_date?: string | null
  }
}
