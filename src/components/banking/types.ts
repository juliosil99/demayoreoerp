
export type AccountType = "Bank" | "Cash" | "Credit Card" | "Credit Simple";
export type AccountCurrency = "MXN" | "USD";

export interface BankAccount {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  initial_balance: number;
  balance_date: string;
  created_at: string;
  currency: AccountCurrency;
  company_id: string;
  // Credit card specific fields
  payment_due_day?: number;
  statement_cut_day?: number;
  credit_limit?: number;
  minimum_payment_percentage?: number;
  // Loan specific fields
  monthly_payment?: number;
  total_term_months?: number;
  remaining_months?: number;
  original_loan_amount?: number;
  loan_start_date?: string;
  // Common credit field
  interest_rate?: number;
}

export interface NewBankAccount {
  name: string;
  type: AccountType;
  balance: number;
  initial_balance: number;
  balance_date: string;
  currency: AccountCurrency;
  company_id?: string; // Optional for creation, will be set automatically
  // Credit card specific fields
  payment_due_day?: number;
  statement_cut_day?: number;
  credit_limit?: number;
  minimum_payment_percentage?: number;
  // Loan specific fields
  monthly_payment?: number;
  total_term_months?: number;
  remaining_months?: number;
  original_loan_amount?: number;
  loan_start_date?: string;
  // Common credit field
  interest_rate?: number;
}
