
import type { Database } from "@/integrations/supabase/types/base";

export type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string; currency: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
};

export type ExpenseFormData = {
  date: string;
  description: string;
  amount: string;
  original_amount: string;
  account_id: string;
  chart_account_id: string;
  payment_method: string;
  reference_number: string;
  notes: string;
  supplier_id: string;
  category: string;
  currency: string;
  exchange_rate: string;
  isReturn: boolean; // Field to track if this is a return/refund
};
