
import type { Database } from "@/integrations/supabase/types";

type ExpenseRow = Database['public']['Tables']['expenses']['Row'];

export interface Expense extends ExpenseRow {
  bank_accounts: { name: string; currency: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string; type?: string } | null;
  expense_invoice_relations?: {
    invoice: {
      id: number;
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
}
