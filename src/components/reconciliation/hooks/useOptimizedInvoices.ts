
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserCompany } from "@/hooks/useUserCompany";
import { usePermissions } from "@/hooks/usePermissions";

export const useOptimizedInvoices = () => {
  const { data: userCompany } = useUserCompany();
  const { hasPermission } = usePermissions();
  const canViewReconciliation = hasPermission('can_view_reconciliation');

  return useQuery({
    queryKey: ["optimized-unreconciled-invoices", userCompany?.id],
    queryFn: async () => {
      if (!userCompany?.id || !canViewReconciliation) {
        return [];
      }
      
      const companyRfc = userCompany.rfc;
      console.log("🔍 Optimized Invoice Query - Company RFC:", companyRfc);
      
      // Optimized query using the new indexes
      const { data: allInvoices, error } = await supabase
        .from("invoices")
        .select("*, paid_amount")
        .or(`issuer_rfc.eq.${companyRfc},receiver_rfc.eq.${companyRfc}`)
        .order("invoice_date", { ascending: false })
        .limit(1000); // Reasonable limit to prevent large data loads

      if (error) {
        console.error("❌ Error fetching optimized invoices:", error);
        throw error;
      }

      console.log("📊 Optimized invoices found:", allInvoices?.length || 0);
      
      // Filter logic: Include unprocessed invoices AND processed payroll invoices
      const filteredInvoices = allInvoices?.filter(invoice => {
        // For payroll invoices (type N), include both processed and unprocessed
        if (invoice.invoice_type === 'N' && invoice.issuer_rfc === companyRfc) {
          return true;
        }
        
        // For other invoices, only include unprocessed ones
        return !invoice.processed;
      }) || [];

      console.log("🎯 Optimized filtered invoices:", filteredInvoices.length);
      
      return filteredInvoices;
    },
    enabled: !!userCompany?.id && canViewReconciliation,
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
