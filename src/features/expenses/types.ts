
import { Database } from "@/integrations/supabase/types/base";

export type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
  expense_invoice_relations?: {
    invoice: {
      uuid: string;
      invoice_number: string;
      file_path: string;
      filename: string;
      content_type?: string;
    }
  }[];
};

export interface ExpenseFormData {
  date: string;
  amount: string;
  description: string;
  bank_account_id: string;
  chart_account_id: string;
  contact_id?: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
}
