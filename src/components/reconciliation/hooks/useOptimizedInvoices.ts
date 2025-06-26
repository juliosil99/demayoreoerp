
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
      
      // Get reconciled invoice IDs from expense_invoice_relations
      const { data: reconciledInvoiceIds, error: relationError } = await supabase
        .from('expense_invoice_relations')
        .select('invoice_id');
      
      if (relationError) {
        console.error("❌ Error fetching reconciled invoice IDs:", relationError);
      }
      
      const reconciledIds = reconciledInvoiceIds?.map(rel => rel.invoice_id) || [];
      console.log("🔗 Reconciled invoice IDs from relations:", reconciledIds.length);

      // Build the main query to get unreconciled invoices only
      let query = supabase
        .from("invoices")
        .select("*, paid_amount")
        .or(`issuer_rfc.eq.${companyRfc},receiver_rfc.eq.${companyRfc}`)
        .order("invoice_date", { ascending: false })
        .limit(1000);

      // Exclude invoices that are already reconciled by any method
      if (reconciledIds.length > 0) {
        query = query.not('id', 'in', `(${reconciledIds.join(',')})`);
      }
      
      // Exclude manually reconciled invoices
      query = query.neq('manually_reconciled', true);
      
      // Exclude invoices that are part of reconciliation batches
      query = query.is('reconciliation_batch_id', null);

      const { data: allInvoices, error } = await query;

      if (error) {
        console.error("❌ Error fetching optimized invoices:", error);
        throw error;
      }

      console.log("📊 Total invoices found:", allInvoices?.length || 0);
      
      // Additional filtering for payroll invoices and processed status
      const filteredInvoices = allInvoices?.filter(invoice => {
        // For payroll invoices (type N), include both processed and unprocessed if they're issued by the company
        if (invoice.invoice_type === 'N' && invoice.issuer_rfc === companyRfc) {
          // Even payroll invoices should be excluded if they're manually reconciled or in a batch
          return !invoice.manually_reconciled && !invoice.reconciliation_batch_id;
        }
        
        // For other invoices, only include unprocessed ones
        return !invoice.processed && !invoice.manually_reconciled && !invoice.reconciliation_batch_id;
      }) || [];

      console.log("🎯 Final filtered unreconciled invoices:", filteredInvoices.length);
      
      return filteredInvoices;
    },
    enabled: !!userCompany?.id && canViewReconciliation,
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
