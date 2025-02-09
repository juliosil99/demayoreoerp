
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClientQuery = () => {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("id, name, rfc")
        .eq("type", "client");

      if (error) throw error;
      return data;
    },
  });
};

export const useUnpaidInvoicesQuery = () => {
  return useQuery({
    queryKey: ["unpaid-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, invoice_date")
        .eq("status", "pending");

      if (error) throw error;
      return data;
    },
  });
};
