
export interface AccountPayable {
  id: string;
  user_id: string;
  amount: number;
  client_id?: string;
  expense_id?: string;
  payment_id?: string;
  invoice_id?: number;
  due_date: string;
  notes?: string;
  status: 'pending' | 'paid';
  payment_term: number;
  created_at: string;
  chart_account_id?: string;
  // Recurring payment fields
  is_recurring?: boolean;
  recurrence_pattern?: string;
  recurrence_day?: number;
  recurrence_end_date?: string;
  parent_payable_id?: string;
  series_number?: number;
  client?: {
    name: string;
    rfc: string;
  };
  invoice?: {
    id: number;
    invoice_number: string;
    invoice_date: string;
    uuid: string;
  };
}

