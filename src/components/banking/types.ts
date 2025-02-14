
export type AccountType = "Bank" | "Cash" | "Credit Card" | "Credit Simple";

export interface BankAccount {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  created_at: string;
}

export interface NewBankAccount {
  name: string;
  type: AccountType;
  balance: number;
}
