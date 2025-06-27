
import { useQuery } from "@tanstack/react-query";
import { getReconciledInvoiceIds } from "./services/reconciliationService";
import { buildInvoiceQuery } from "./services/invoiceQueryBuilder";
import { transformInvoices } from "./services/invoiceTransformer";
import { validatePaginationParams } from "./utils/paginationUtils";
import type { 
  UseOptimizedInvoicesOptions, 
  OptimizedInvoicesResult 
} from "./types/optimizedInvoiceTypes";

export const useOptimizedInvoices = ({
  page,
  itemsPerPage,
  filters
}: UseOptimizedInvoicesOptions): OptimizedInvoicesResult => {
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['optimized-invoices', page, itemsPerPage, filters],
    queryFn: async () => {
      
      // Always get the list of reconciled invoice IDs to determine reconciliation status correctly
      const reconciledInvoiceIds = await getReconciledInvoiceIds();

      // Build the main query
      const query = buildInvoiceQuery(filters, reconciledInvoiceIds);

      // Get total count first
      const { count: totalCount, error: countError } = await query;
      
      if (countError) {
        console.error("Error getting count:", countError);
        throw countError;
      }

      // Validate pagination parameters
      const { from, to } = validatePaginationParams(page, itemsPerPage, totalCount || 0);

      const { data: invoices, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching optimized invoices:", error);
        throw error;
      }

      // Transform the data to include reconciliation status and type
      const transformedInvoices = transformInvoices(invoices || [], reconciledInvoiceIds);
      
      return {
        invoices: transformedInvoices,
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

// Re-export types for backward compatibility
export type { InvoiceFilters } from "./types/optimizedInvoiceTypes";
