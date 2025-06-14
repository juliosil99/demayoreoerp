
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface OptimizedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  transactionType: string;
  referenceNumber: string | null;
  currency: string;
  clientName: string | null;
  chartAccountName: string | null;
}

export function useOptimizedAccountTransactions(accountId: number | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['optimized-account-transactions', accountId],
    queryFn: async (): Promise<OptimizedTransaction[]> => {
      if (!accountId || !user?.id) {
        return [];
      }

      try {
        // Use the optimized unified view instead of multiple queries
        const { data, error } = await supabase
          .from('bank_transactions_unified')
          .select(`
            transaction_type,
            transaction_id,
            date,
            description,
            amount,
            reference_number,
            currency,
            client_name,
            chart_account_name
          `)
          .eq('account_id', accountId)
          .order('date', { ascending: false })
          .limit(100); // Limit to last 100 transactions

        if (error) throw error;

        return data?.map(transaction => ({
          id: transaction.transaction_id,
          date: transaction.date,
          description: transaction.description,
          amount: Number(transaction.amount),
          transactionType: transaction.transaction_type,
          referenceNumber: transaction.reference_number,
          currency: transaction.currency,
          clientName: transaction.client_name,
          chartAccountName: transaction.chart_account_name
        })) || [];
      } catch (error) {
        console.error('Error fetching optimized transactions:', error);
        throw error;
      }
    },
    enabled: !!accountId && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
    retry: 2
  });
}
