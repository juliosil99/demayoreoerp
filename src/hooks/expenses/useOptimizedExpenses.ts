
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OptimizedExpense {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  accountId: number;
  chartAccountId: string;
  supplierName?: string;
  referenceNumber?: string;
}

export function useOptimizedExpenses(limit: number = 50) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['optimized-expenses', user?.id, limit],
    queryFn: async (): Promise<OptimizedExpense[]> => {
      if (!user?.id) return [];

      // Select only essential columns to reduce data transfer
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          date,
          description,
          amount,
          currency,
          account_id,
          chart_account_id,
          reference_number,
          contacts:supplier_id (name)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(expense => ({
        id: expense.id,
        date: expense.date,
        description: expense.description,
        amount: Number(expense.amount),
        currency: expense.currency,
        accountId: expense.account_id,
        chartAccountId: expense.chart_account_id,
        supplierName: expense.contacts?.name,
        referenceNumber: expense.reference_number
      })) || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
  });
}
