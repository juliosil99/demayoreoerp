
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
      console.log(`Fetching invoices page ${page} with filters:`, filters);
      
      // First, get the list of reconciled invoice IDs if we need to filter by reconciliation status
      let reconciledInvoiceIds: number[] = [];
      if (filters.reconciliationStatus !== 'all') {
        const { data: relations, error: relationsError } = await supabase
          .from('expense_invoice_relations')
          .select('invoice_id');
        
        if (!relationsError && relations) {
          reconciledInvoiceIds = relations.map(rel => rel.invoice_id);
        }
      }

      let query = supabase
        .from("invoices")
        .select('*', { count: 'exact' });

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
        query = query.or(`id.in.(${reconciledInvoiceIds.join(',')}),manually_reconciled.eq.true`);
      } else if (filters.reconciliationStatus === 'unreconciled') {
        // Show invoices that are NOT in expense_invoice_relations AND manually_reconciled = false
        if (reconciledInvoiceIds.length > 0) {
          query = query.not('id', 'in', `(${reconciledInvoiceIds.join(',')})`);
        }
        query = query.eq('manually_reconciled', false);
      }

      // Apply pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data: invoices, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching optimized invoices:", error);
        throw error;
      }

      // Transform the data to include reconciliation status and type
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

      console.log(`Fetched ${transformedInvoices.length} invoices out of ${count || 0} total`);
      
      return {
        invoices: transformedInvoices as (Partial<Invoice> & { 
          is_reconciled?: boolean;
          reconciliation_type?: 'automatic' | 'manual' | null;
        })[],
        totalCount: count || 0
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
