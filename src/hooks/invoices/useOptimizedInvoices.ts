
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
}

interface UseOptimizedInvoicesOptions {
  page: number;
  itemsPerPage: number;
  filters: InvoiceFilters;
}

interface OptimizedInvoicesResult {
  invoices: (Partial<Invoice> & { is_reconciled?: boolean })[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
}

// Select only the columns we need for the table display, plus reconciliation info
const INVOICE_COLUMNS = [
  'invoices.id',
  'invoices.filename',
  'invoices.created_at',
  'invoices.invoice_date',
  'invoices.invoice_number',
  'invoices.invoice_type',
  'invoices.serie',
  'invoices.issuer_name',
  'invoices.issuer_rfc',
  'invoices.receiver_name', 
  'invoices.receiver_rfc',
  'invoices.total_amount',
  'invoices.tax_amount',
  'invoices.status',
  'expense_invoice_relations.id as relation_id'
].join(',');

export const useOptimizedInvoices = ({
  page,
  itemsPerPage,
  filters
}: UseOptimizedInvoicesOptions): OptimizedInvoicesResult => {
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['optimized-invoices', page, itemsPerPage, filters],
    queryFn: async () => {
      console.log(`Fetching invoices page ${page} with filters:`, filters);
      
      let query = supabase
        .from("invoices")
        .select(INVOICE_COLUMNS, { count: 'exact' })
        .leftJoin('expense_invoice_relations', 'invoices.id', 'expense_invoice_relations.invoice_id');

      // Apply search filter
      if (filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(`invoices.invoice_number.ilike.${searchTerm},invoices.issuer_name.ilike.${searchTerm},invoices.receiver_name.ilike.${searchTerm},invoices.uuid.ilike.${searchTerm}`);
      }

      // Apply date range filters
      if (filters.dateFrom) {
        const fromDate = filters.dateFrom.toISOString().split('T')[0];
        query = query.gte('invoices.invoice_date', fromDate);
      }

      if (filters.dateTo) {
        const toDate = filters.dateTo.toISOString().split('T')[0];
        query = query.lte('invoices.invoice_date', toDate);
      }

      // Apply invoice type filter
      if (filters.invoiceType && filters.invoiceType !== 'all') {
        query = query.eq('invoices.invoice_type', filters.invoiceType);
      }

      // Apply amount filters
      if (filters.minAmount) {
        const minAmount = parseFloat(filters.minAmount);
        if (!isNaN(minAmount)) {
          query = query.gte('invoices.total_amount', minAmount);
        }
      }

      if (filters.maxAmount) {
        const maxAmount = parseFloat(filters.maxAmount);
        if (!isNaN(maxAmount)) {
          query = query.lte('invoices.total_amount', maxAmount);
        }
      }

      // Apply reconciliation status filter
      if (filters.reconciliationStatus === 'reconciled') {
        query = query.not('expense_invoice_relations.id', 'is', null);
      } else if (filters.reconciliationStatus === 'unreconciled') {
        query = query.is('expense_invoice_relations.id', null);
      }

      // Apply pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data: invoices, error, count } = await query
        .order("invoices.created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching optimized invoices:", error);
        throw error;
      }

      // Transform the data to include reconciliation status
      const transformedInvoices = invoices?.map((invoice: any) => ({
        ...invoice,
        is_reconciled: invoice.relation_id !== null
      })) || [];

      console.log(`Fetched ${transformedInvoices.length} invoices out of ${count || 0} total`);
      
      return {
        invoices: transformedInvoices as (Partial<Invoice> & { is_reconciled?: boolean })[],
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
