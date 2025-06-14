
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
}

interface UseOptimizedInvoicesOptions {
  page: number;
  itemsPerPage: number;
  filters: InvoiceFilters;
}

interface OptimizedInvoicesResult {
  invoices: Partial<Invoice>[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
}

// Select only the columns we need for the table display
const INVOICE_COLUMNS = [
  'id',
  'filename',
  'created_at',
  'invoice_date',
  'invoice_number',
  'invoice_type',
  'serie',
  'issuer_name',
  'issuer_rfc',
  'receiver_name', 
  'receiver_rfc',
  'total_amount',
  'tax_amount',
  'status'
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
        .select(INVOICE_COLUMNS, { count: 'exact' });

      // Apply search filter
      if (filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(`invoice_number.ilike.${searchTerm},issuer_name.ilike.${searchTerm},receiver_name.ilike.${searchTerm},uuid.ilike.${searchTerm}`);
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
      if (filters.minAmount) {
        const minAmount = parseFloat(filters.minAmount);
        if (!isNaN(minAmount)) {
          query = query.gte('total_amount', minAmount);
        }
      }

      if (filters.maxAmount) {
        const maxAmount = parseFloat(filters.maxAmount);
        if (!isNaN(maxAmount)) {
          query = query.lte('total_amount', maxAmount);
        }
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

      console.log(`Fetched ${invoices?.length || 0} invoices out of ${count || 0} total`);
      
      return {
        invoices: invoices as Partial<Invoice>[],
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
