
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountPayable } from "@/types/payables";

export type PayableStatusFilter = "pending" | "paid" | "all";

export function useFetchPayables(statusFilter: PayableStatusFilter = "pending") {
  return useQuery({
    queryKey: ["payables", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("accounts_payable")
        .select(`
          *,
          client:contacts!client_id(name, rfc),
          invoice:invoices!invoice_id(invoice_number, invoice_date, id, uuid)
        `);
      
      // Apply status filter if not "all"
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query.order('due_date', { ascending: true });

      if (error) throw error;
      return data as AccountPayable[];
    },
  });
}
