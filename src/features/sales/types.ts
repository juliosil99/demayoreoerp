
export interface Payment {
  id: string;
  date: string;
  amount: number;
  payment_method: 'cash' | 'transfer' | 'check' | 'credit_card';
  reference_number?: string;
  sales_channel_id?: string;
  account_id: number;
  notes?: string;
}

export interface PaymentWithRelations extends Payment {
  sales_channels: { name: string } | null;
  bank_accounts: { name: string };
}
