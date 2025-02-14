
export type AccountType = "Bank" | "Cash" | "Credit Card" | "Credit Simple";

export interface BankAccount {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  created_at: string;
  chart_of_accounts: {
    code: string;
    name: string;
  } | null;
}

export interface NewBankAccount {
  name: string;
  type: AccountType;
  balance: number;
}
