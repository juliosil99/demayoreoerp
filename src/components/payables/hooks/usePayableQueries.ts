
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useClientQuery() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      console.log("[useClientQuery] Fetching suppliers");
      const { data, error } = await supabase
        .from("contacts")
        .select("id, name, rfc, default_chart_account_id")
        .eq("type", "supplier")
        .order("name");

      if (error) {
        console.error("[useClientQuery] Error fetching suppliers:", error);
        throw error;
      }
      
      console.log("[useClientQuery] Fetched suppliers:", data?.length, "with data:", data);
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
      console.log("[useChartAccountsQuery] Fetching chart accounts");
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("id, code, name, account_type")
        .eq("account_type", "expense")
        .order("code");

      if (error) {
        console.error("[useChartAccountsQuery] Error fetching chart accounts:", error);
        throw error;
      }
      
      console.log("[useChartAccountsQuery] Fetched chart accounts:", data?.length);
      return data;
    },
  });
}
