
export interface AccountingAdjustment {
  id: string;
  expense_id: string;
  invoice_id: number;
  amount: number;
  type: "expense_excess" | "invoice_excess";
  chart_account_id: string;
  notes: string;
  created_at: string;
  status: "pending" | "processed";
}

export interface ChartAccount {
  id: string;
  code: string;
  name: string;
  account_type: string;
  level: number;
}
