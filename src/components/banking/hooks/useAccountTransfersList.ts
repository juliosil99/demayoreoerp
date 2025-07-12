
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// Define the TransferRow type properly without using bracket notation
interface TransferRow {
  id: string;
  date: string;
  from_account_id: number;
  to_account_id: number;
  amount_from: number;
  amount_to: number;
  amount?: number; // For backward compatibility
  reference_number: string | null;
  notes: string | null;
  user_id: string;
  status: string;
  company_id: string;
  selected_invoice_id: number | null;
  from_account?: { name: string };
  to_account?: { name: string };
  selected_invoice?: {
    id: number;
    invoice_number: string | null;
    issuer_name: string | null;
    total_amount: number | null;
    uuid: string | null;
    filename: string;
    file_path: string;
  };
  created_at?: string;
  invoice_file_path?: string;
  invoice_filename?: string;
  invoice_content_type?: string;
  invoice_size?: number;
}

export function useAccountTransfersList() {
  const { user } = useAuth();
  
  const { data: transfers, isLoading: isLoadingTransfers } = useQuery({
    queryKey: ["account-transfers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_transfers")
        .select(`
          id, 
          date, 
          from_account_id, 
          to_account_id, 
          amount,
          amount_from,
          amount_to, 
          reference_number, 
          notes, 
          status,
          user_id,
          company_id,
          selected_invoice_id,
          created_at,
          invoice_file_path,
          invoice_filename,
          invoice_content_type,
          invoice_size,
          from_account:bank_accounts!fk_from_account(name),
          to_account:bank_accounts!account_transfers_to_account_id_fkey(name),
          selected_invoice:invoices!account_transfers_selected_invoice_id_fkey(
            id,
            invoice_number,
            issuer_name,
            total_amount,
            uuid,
            filename,
            file_path
          )
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data as TransferRow[];
    },
    enabled: !!user?.id,
  });

  return {
    transfers,
    isLoadingTransfers
  };
}
