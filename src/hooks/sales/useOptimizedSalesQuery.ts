
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SalesBase } from "@/integrations/supabase/types/sales";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

interface UseSalesQueryOptions {
  currentPage: number;
  itemsPerPage: number;
  searchTerm: string;
  showNegativeProfit: boolean;
}

interface SalesQueryResult {
  sales: SalesBase[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
}

export const useOptimizedSalesQuery = ({
  currentPage,
  itemsPerPage,
  searchTerm,
  showNegativeProfit
}: UseSalesQueryOptions): SalesQueryResult => {
  const { measureQuery } = usePerformanceMonitor();
  
  // Create a cache key that includes all filter parameters
  const cacheKey = ["sales", currentPage, searchTerm, showNegativeProfit, itemsPerPage];

  const { data, isLoading, error } = useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      return measureQuery('sales-page-query', async () => {
        // Select only the columns we need for the table
        const columns = [
          'id',
          'date',
          'orderNumber',
          'sku',
          'productName',
          'Channel',
          'price',
          'Profit'
        ].join(',');

        let query = supabase
          .from("Sales")
          .select(columns, { count: 'exact' });

        // Apply filters
        if (searchTerm) {
          query = query.ilike("orderNumber", `%${searchTerm}%`);
        }

        if (showNegativeProfit) {
          query = query.lt("Profit", 0);
        }

        // Apply pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const { data: sales, error, count } = await query
          .order("date", { ascending: false })
          .range(from, to);

        if (error) {
          console.error("Error fetching sales:", error);
          throw error;
        }

        return {
          sales: sales as unknown as SalesBase[],
          totalCount: count || 0
        };
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache retention
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  return {
    sales: data?.sales || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error: error as Error | null
  };
};
