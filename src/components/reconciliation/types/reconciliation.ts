
/**
 * Reconciliation type definitions
 */
export interface ReconciliationExpense {
  id: string;
  amount: number;
  date: string;
  description: string;
  bank_accounts: {
    name: string;
  };
  chart_of_accounts: {
    name: string;
    code: string;
  };
  contacts?: {
    name: string;
  } | null;
  [key: string]: any;
}

export interface ReconciliationInvoice {
  id: string;
  uuid: string;
  invoice_number: string;
  total_amount: number;
  paid_amount?: number;
  invoice_date: string;
  [key: string]: any;
}
