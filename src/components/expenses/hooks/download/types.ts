
import type { Database } from "@/integrations/supabase/types/base";

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

export type DownloadItem = {
  filePath: string;
  fileName: string;
  contentType?: string;
  index: number;
  total: number;
};

export type DownloadProgress = {
  current: number;
  total: number;
};
