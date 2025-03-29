
export interface BankAccountsTable {
  Row: {
    id: number
    created_at: string | null
    name: string
    type: "Bank" | "Cash" | "Credit Card" | "Credit Simple"
    balance: number | null
    initial_balance: number | null
    balance_date: string | null
    currency: "MXN" | "USD" | null
  }
  Insert: {
    id?: number
    created_at?: string | null
    name: string
    type: "Bank" | "Cash" | "Credit Card" | "Credit Simple"
    balance?: number | null
    initial_balance?: number | null
    balance_date?: string | null
    currency?: "MXN" | "USD" | null
  }
  Update: {
    id?: number
    created_at?: string | null
    name?: string
    type?: "Bank" | "Cash" | "Credit Card" | "Credit Simple"
    balance?: number | null
    initial_balance?: number | null
    balance_date?: string | null
    currency?: "MXN" | "USD" | null
  }
}
