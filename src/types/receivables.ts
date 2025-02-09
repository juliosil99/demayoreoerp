
export interface AccountReceivable {
  id: string;
  invoice_id: number | null;
  client_id: string | null;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  notes: string | null;
  created_at: string;
  payment_id: string | null;
  client?: {
    name: string;
    rfc: string;
  };
  invoice?: {
    invoice_number: string;
    invoice_date: string;
  };
}
