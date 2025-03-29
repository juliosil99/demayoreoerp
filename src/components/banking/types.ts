
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
}

export interface NewBankAccount {
  name: string;
  type: AccountType;
  balance: number;
  initial_balance: number;
  balance_date: string;
  currency: AccountCurrency;
}
