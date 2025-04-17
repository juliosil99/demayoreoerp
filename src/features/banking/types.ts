
export interface BankAccount {
  id: number;
  name: string;
  type: "Bank" | "Cash" | "Credit Card" | "Credit Simple";
  currency: AccountCurrency;
  balance: number;
  initial_balance: number;
  balance_date: string;
  payment_due_day?: number;
  statement_cut_day?: number;
  monthly_payment?: number;
  remaining_months?: number;
}

export type AccountCurrency = "MXN" | "USD";

export interface TransferFormData {
  date: string;
  from_account_id: string;
  to_account_id: string;
  amount_from: string;
  amount_to: string;
  exchange_rate: string;
  reference_number: string;
  notes: string;
}
