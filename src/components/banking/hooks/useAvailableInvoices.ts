import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserCompany } from "@/hooks/useUserCompany";

export interface AvailableInvoice {
  id: number;
  invoice_number: string | null;
  invoice_date: string | null;
  issuer_name: string | null;
  issuer_rfc: string | null;
  total_amount: number | null;
  currency: string | null;
  serie: string | null;
}

export function useAvailableInvoices() {
  const { data: userCompany } = useUserCompany();

  return useQuery({
    queryKey: ["available-invoices", userCompany?.rfc],
    queryFn: async (): Promise<AvailableInvoice[]> => {
      if (!userCompany?.rfc) {
        return [];
      }

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          invoice_date,
          issuer_name,
          issuer_rfc,
          total_amount,
          currency,
          serie
        `)
        .eq("receiver_rfc", userCompany.rfc)
        .eq("processed", false)
        .or("manually_reconciled.is.null,manually_reconciled.eq.false")
        .not("issuer_rfc", "eq", userCompany.rfc) // Exclude invoices issued by the company
        .order("invoice_date", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching available invoices:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!userCompany?.rfc,
  });
}