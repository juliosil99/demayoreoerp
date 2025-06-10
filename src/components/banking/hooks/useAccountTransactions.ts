
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { AccountTransaction } from "./transaction-types";
import { 
  fetchExpenses, 
  fetchPayments, 
  fetchTransfersFrom, 
  fetchTransfersTo,
  fetchAccountCurrency 
} from "./transaction-fetchers";
import {
  transformExpensesToTransactions,
  transformPaymentsToTransactions,
  transformTransfersFromToTransactions,
  transformTransfersToToTransactions,
  sortTransactionsByDate
} from "./transaction-transformers";

// Re-export the AccountTransaction type for backward compatibility
export type { AccountTransaction };

export function useAccountTransactions(accountId: number | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['account-transactions', accountId],
    queryFn: async (): Promise<AccountTransaction[]> => {
      if (!accountId || !user?.id) {
        return [];
      }

      // Fetch the currency for this account
      const accountCurrency = await fetchAccountCurrency(accountId);
      
      // Fetch all transaction types in parallel
      const [expenses, payments, transfersFrom, transfersTo] = await Promise.all([
        fetchExpenses(accountId, user.id),
        fetchPayments(accountId, user.id),
        fetchTransfersFrom(accountId, user.id),
        fetchTransfersTo(accountId, user.id)
      ]);

      // Transform each transaction type to the unified format
      const expensesFormatted = transformExpensesToTransactions(expenses, accountCurrency);
      const paymentsFormatted = transformPaymentsToTransactions(payments);
      const transfersFromFormatted = transformTransfersFromToTransactions(transfersFrom, accountCurrency);
      const transfersToFormatted = transformTransfersToToTransactions(transfersTo, accountCurrency);

      // Combine all transactions and sort by date
      const allTransactions = sortTransactionsByDate([
        ...expensesFormatted,
        ...paymentsFormatted,
        ...transfersFromFormatted,
        ...transfersToFormatted
      ]);

      return allTransactions;
    },
    enabled: !!accountId && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache para transacciones
    gcTime: 10 * 60 * 1000, // 10 minutos en garbage collection
    refetchOnMount: true,
    retry: 2
  });
}
