
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
    company_id: string
    payment_due_day: number | null
    statement_cut_day: number | null
    credit_limit: number | null
    minimum_payment_percentage: number | null
    monthly_payment: number | null
    total_term_months: number | null
    remaining_months: number | null
    original_loan_amount: number | null
    loan_start_date: string | null
    interest_rate: number | null
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
    company_id: string
    payment_due_day?: number | null
    statement_cut_day?: number | null
    credit_limit?: number | null
    minimum_payment_percentage?: number | null
    monthly_payment?: number | null
    total_term_months?: number | null
    remaining_months?: number | null
    original_loan_amount?: number | null
    loan_start_date?: string | null
    interest_rate?: number | null
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
    company_id?: string
    payment_due_day?: number | null
    statement_cut_day?: number | null
    credit_limit?: number | null
    minimum_payment_percentage?: number | null
    monthly_payment?: number | null
    total_term_months?: number | null
    remaining_months?: number | null
    original_loan_amount?: number | null
    loan_start_date?: string | null
    interest_rate?: number | null
  }
}
