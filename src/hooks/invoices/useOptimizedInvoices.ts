
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

export interface InvoiceFilters {
  search: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  invoiceType: string;
  minAmount: string;
  maxAmount: string;
  reconciliationStatus: string;
  issuerName: string;
  receiverName: string;
}

interface UseOptimizedInvoicesOptions {
  page: number;
  itemsPerPage: number;
  filters: InvoiceFilters;
}

interface OptimizedInvoicesResult {
  invoices: (Partial<Invoice> & { 
    is_reconciled?: boolean;
    reconciliation_type?: 'automatic' | 'manual' | null;
  })[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
}

export const useOptimizedInvoices = ({
  page,
  itemsPerPage,
  filters
}: UseOptimizedInvoicesOptions): OptimizedInvoicesResult => {
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['optimized-invoices', page, itemsPerPage, filters],
    queryFn: async () => {
      
      // Always get the list of reconciled invoice IDs to determine reconciliation status correctly
      const { data: relations, error: relationsError } = await supabase
        .from('expense_invoice_relations')
        .select('invoice_id');
      
      if (relationsError) {
        console.error("Error fetching reconciled invoice IDs:", relationsError);
        throw relationsError;
      }
      
      const reconciledInvoiceIds = relations?.map(rel => rel.invoice_id) || [];

      // Build the main query with ONLY the fields we need for the UI
      let query = supabase
        .from("invoices")
        .select(`
          id,
          filename,
          invoice_date,
          created_at,
          invoice_number,
          serie,
          invoice_type,
          issuer_name,
          issuer_rfc,
          receiver_name,
          receiver_rfc,
          total_amount,
          tax_amount,
          status,
          manually_reconciled,
          file_path
        `, { count: 'exact' });

      // Apply search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(`invoice_number.ilike.${searchTerm},issuer_name.ilike.${searchTerm},receiver_name.ilike.${searchTerm},uuid.ilike.${searchTerm}`);
      }

      // Apply issuer name filter
      if (filters.issuerName && filters.issuerName.trim()) {
        const issuerTerm = `%${filters.issuerName.trim()}%`;
        query = query.ilike('issuer_name', issuerTerm);
      }

      // Apply receiver name filter
      if (filters.receiverName && filters.receiverName.trim()) {
        const receiverTerm = `%${filters.receiverName.trim()}%`;
        query = query.ilike('receiver_name', receiverTerm);
      }

      // Apply date range filters
      if (filters.dateFrom) {
        const fromDate = filters.dateFrom.toISOString().split('T')[0];
        query = query.gte('invoice_date', fromDate);
      }

      if (filters.dateTo) {
        const toDate = filters.dateTo.toISOString().split('T')[0];
        query = query.lte('invoice_date', toDate);
      }

      // Apply invoice type filter
      if (filters.invoiceType && filters.invoiceType !== 'all') {
        query = query.eq('invoice_type', filters.invoiceType);
      }

      // Apply amount filters
      if (filters.minAmount && filters.minAmount.trim()) {
        const minAmount = parseFloat(filters.minAmount.trim());
        if (!isNaN(minAmount)) {
          query = query.gte('total_amount', minAmount);
        }
      }

      if (filters.maxAmount && filters.maxAmount.trim()) {
        const maxAmount = parseFloat(filters.maxAmount.trim());
        if (!isNaN(maxAmount)) {
          query = query.lte('total_amount', maxAmount);
        }
      }

      // Apply reconciliation status filter with enhanced logic
      if (filters.reconciliationStatus === 'reconciled') {
        // Show invoices that are either in expense_invoice_relations OR manually_reconciled = true
        if (reconciledInvoiceIds.length > 0) {
          query = query.or(`id.in.(${reconciledInvoiceIds.join(',')}),manually_reconciled.eq.true`);
        } else {
          query = query.eq('manually_reconciled', true);
        }
      } else if (filters.reconciliationStatus === 'unreconciled') {
        // Show invoices that are NOT in expense_invoice_relations AND manually_reconciled = false
        if (reconciledInvoiceIds.length > 0) {
          query = query.not('id', 'in', `(${reconciledInvoiceIds.join(',')})`);
        }
        query = query.eq('manually_reconciled', false);
      }

      // Get total count first
      const { count: totalCount, error: countError } = await query;
      
      if (countError) {
        console.error("Error getting count:", countError);
        throw countError;
      }

      // Validate pagination parameters
      const safeItemsPerPage = Math.max(1, itemsPerPage);
      const maxPage = Math.max(1, Math.ceil((totalCount || 0) / safeItemsPerPage));
      const safePage = Math.min(Math.max(1, page), maxPage);
      
      // Apply pagination with validated parameters
      const from = (safePage - 1) * safeItemsPerPage;
      const to = from + safeItemsPerPage - 1;

      const { data: invoices, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching optimized invoices:", error);
        throw error;
      }

      // Transform the data to include reconciliation status and type
      // Now we always have reconciledInvoiceIds available for accurate status determination
      const transformedInvoices = invoices?.map((invoice: any) => {
        const hasExpenseRelation = reconciledInvoiceIds.includes(invoice.id);
        const isManuallyReconciled = invoice.manually_reconciled === true;
        const isReconciled = hasExpenseRelation || isManuallyReconciled;
        
        return {
          ...invoice,
          is_reconciled: isReconciled,
          reconciliation_type: hasExpenseRelation ? 'automatic' : 
                              isManuallyReconciled ? 'manual' : null
        };
      }) || [];
      
      return {
        invoices: transformedInvoices as (Partial<Invoice> & { 
          is_reconciled?: boolean;
          reconciliation_type?: 'automatic' | 'manual' | null;
        })[],
        totalCount: totalCount || 0
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - data stays fresh
    gcTime: 5 * 60 * 1000, // 5 minutes - cache retention
    refetchOnWindowFocus: false,
  });

  return {
    invoices: data?.invoices || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error: error as Error | null
  };
};
