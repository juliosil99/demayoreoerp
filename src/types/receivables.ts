
export interface AccountReceivable {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  invoice_id: number;
  client_id?: string;
  created_at: string;
  status: 'pending' | 'paid';
  client?: {
    name: string;
    rfc: string;
  };
  invoice?: {
    invoice_number: string;
    invoice_date: string;
  };
}
