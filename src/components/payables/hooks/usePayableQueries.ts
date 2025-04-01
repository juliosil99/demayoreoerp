
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useClientQuery() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("id, name, rfc")
        .eq("type", "supplier")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

export function useInvoiceQuery(clientId?: string) {
  return useQuery({
    queryKey: ["supplier-invoices", clientId],
    queryFn: async () => {
      if (!clientId) return [];

      // First get the supplier's RFC
      const { data: supplierData, error: supplierError } = await supabase
        .from("contacts")
        .select("rfc")
        .eq("id", clientId)
        .single();

      if (supplierError) throw supplierError;
      const supplierRfc = supplierData?.rfc || '';

      // Now use the RFC to query invoices
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, uuid, total_amount, invoice_date")
        .eq("issuer_rfc", supplierRfc)
        .eq("processed", false) // Only show unprocessed invoices
        .order("invoice_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
}

export function useBankAccountsQuery() {
  return useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
}

export function useChartAccountsQuery() {
  return useQuery({
    queryKey: ["chart-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("id, code, name")
        .order("code");

      if (error) throw error;
      return data;
    },
  });
}
