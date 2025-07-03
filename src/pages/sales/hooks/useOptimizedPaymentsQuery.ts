import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { CACHE_CONFIGS, createOptimizedQueryKey } from "@/utils/queryOptimizations";
import { formatDateForQuery } from "@/utils/dateUtils";

export interface PaymentFilter {
  search: string;
  date?: Date;
  paymentMethod: 'all' | 'cash' | 'transfer' | 'credit_card' | 'check';
  isReconciled: boolean | 'all';
}

export interface PaginationState {
  page: number;
  pageSize: number;
}

interface OptimizedPayment {
  id: string;
  date: string;
  amount: number;
  reference_number: string | null;
  payment_method: string;
  is_reconciled: boolean;
  reconciled_amount: number | null;
  reconciled_count: number | null;
  sales_channel_id: string | null;
  account_id: number;
  sales_channels: { name: string } | null;
  bank_accounts: { name: string } | null;
}

interface UseOptimizedPaymentsQueryResult {
  payments: OptimizedPayment[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
}

export const useOptimizedPaymentsQuery = (
  filters: PaymentFilter,
  pagination: PaginationState
): UseOptimizedPaymentsQueryResult => {
  const { user } = useAuth();
  const { measureQuery } = usePerformanceMonitor();

  // Create optimized cache key
  const queryKey = createOptimizedQueryKey("optimized-payments", {
    userId: user?.id,
    filters,
    pagination
  });

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) {
        return { payments: [], totalCount: 0 };
      }

      return measureQuery('optimized-payments-query', async () => {
        // Optimized select - only necessary columns
        const selectColumns = `
          id,
          date,
          amount,
          reference_number,
          payment_method,
          is_reconciled,
          reconciled_amount,
          reconciled_count,
          sales_channel_id,
          account_id,
          sales_channels!inner(name),
          bank_accounts!inner(name)
        `;

        let query = supabase
          .from('payments')
          .select(selectColumns, { count: 'exact' })
          .eq('user_id', user.id);

        // Apply filters efficiently
        if (filters.search) {
          const searchFilter = `%${filters.search.toLowerCase()}%`;
          query = query.or(`reference_number.ilike.${searchFilter}`);
        }

        if (filters.date) {
          query = query.eq('date', formatDateForQuery(filters.date));
        }

        if (filters.paymentMethod !== 'all') {
          query = query.eq('payment_method', filters.paymentMethod);
        }

        if (filters.isReconciled !== 'all') {
          query = query.eq('is_reconciled', filters.isReconciled === true);
        }

        // Apply pagination
        const from = (pagination.page - 1) * pagination.pageSize;
        const to = from + pagination.pageSize - 1;

        const { data: payments, error, count } = await query
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          console.error("Error fetching optimized payments:", error);
          throw error;
        }

        return {
          payments: payments as OptimizedPayment[],
          totalCount: count || 0
        };
      });
    },
    ...CACHE_CONFIGS.DYNAMIC,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!user,
  });

  return {
    payments: data?.payments || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error: error as Error | null
  };
};