
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
  client?: {
    name: string;
    rfc: string;
  };
  invoice?: {
    invoice_number: string;
    invoice_date: string;
  };
}
