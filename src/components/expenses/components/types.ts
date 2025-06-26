
export interface Expense {
  id: string;
  created_at: string;
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
  reconciled: boolean | null;
  reconciliation_date: string | null;
  reconciliation_type: string | null;
  reconciliation_batch_id?: string | null;
  currency: string;
  exchange_rate: number;
  original_amount: number;
  bank_accounts: { name: string; currency: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string; type?: string } | null;
  expense_invoice_relations?: {
    invoice: {
      uuid: string;
      invoice_number: string;
      file_path: string;
      filename: string;
      content_type?: string;
    }
  }[];
  accounts_payable?: {
    id: string;
    client: {
      name: string;
    };
  } | null;
  isReturn?: boolean;
}
