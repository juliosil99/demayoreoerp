
/**
 * Expense related type definitions
 */
export interface BankAccount {
  id: number;
  name: string;
  type: string;
  balance?: number | null;
  balance_date?: string | null;
  initial_balance?: number | null;
  created_at?: string | null;
}

export interface ChartAccount {
  id: string;
  name: string;
  code: string;
  account_type?: string;
  level?: number;
  is_group?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  rfc?: string;
  type?: string;
}

export interface Expense {
  id: string;
  created_at: string | null;
  user_id: string;
  date: string;
  description: string;
  amount: number;
  account_id: number;
  chart_account_id: string;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  supplier_id: string | null;
  category: string | null;
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
  expense_invoice_relations?: {
    invoice: {
      uuid: string;
      invoice_number: string;
    }
  }[];
}

export type FormExpense = Expense;
