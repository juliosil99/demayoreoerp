
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountPayable } from "@/types/payables";

export function useFetchPayables() {
  return useQuery({
    queryKey: ["payables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts_payable")
        .select(`
          *,
          client:contacts!client_id(name, rfc),
          invoice:invoices!invoice_id(invoice_number, invoice_date, id, uuid)
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as AccountPayable[];
    },
  });
}
