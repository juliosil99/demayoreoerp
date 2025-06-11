
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
      console.log('🔍 useAccountTransactions - Starting query');
      console.log('🔍 useAccountTransactions - accountId:', accountId);
      console.log('🔍 useAccountTransactions - user:', user);
      
      if (!accountId || !user?.id) {
        console.log('❌ useAccountTransactions - Missing accountId or user.id');
        console.log('❌ useAccountTransactions - accountId valid:', !!accountId);
        console.log('❌ useAccountTransactions - user.id valid:', !!user?.id);
        return [];
      }

      try {
        console.log('🔄 useAccountTransactions - Fetching account currency...');
        // Fetch the currency for this account
        const accountCurrency = await fetchAccountCurrency(accountId);
        console.log('✅ useAccountTransactions - Account currency:', accountCurrency);
        
        console.log('🔄 useAccountTransactions - Fetching all transaction types...');
        // Fetch all transaction types in parallel
        const [expenses, payments, transfersFrom, transfersTo] = await Promise.all([
          fetchExpenses(accountId, user.id),
          fetchPayments(accountId, user.id),
          fetchTransfersFrom(accountId, user.id),
          fetchTransfersTo(accountId, user.id)
        ]);

        console.log('📊 useAccountTransactions - Fetched data:');
        console.log('📊 - Expenses count:', expenses?.length || 0);
        console.log('📊 - Payments count:', payments?.length || 0);
        console.log('📊 - Transfers from count:', transfersFrom?.length || 0);
        console.log('📊 - Transfers to count:', transfersTo?.length || 0);

        // Transform each transaction type to the unified format
        console.log('🔄 useAccountTransactions - Transforming transactions...');
        const expensesFormatted = transformExpensesToTransactions(expenses, accountCurrency);
        const paymentsFormatted = transformPaymentsToTransactions(payments);
        const transfersFromFormatted = transformTransfersFromToTransactions(transfersFrom, accountCurrency);
        const transfersToFormatted = transformTransfersToToTransactions(transfersTo, accountCurrency);

        console.log('🔄 useAccountTransactions - Transformed data:');
        console.log('🔄 - Expenses formatted count:', expensesFormatted?.length || 0);
        console.log('🔄 - Payments formatted count:', paymentsFormatted?.length || 0);
        console.log('🔄 - Transfers from formatted count:', transfersFromFormatted?.length || 0);
        console.log('🔄 - Transfers to formatted count:', transfersToFormatted?.length || 0);

        // Combine all transactions and sort by date
        const allTransactions = sortTransactionsByDate([
          ...expensesFormatted,
          ...paymentsFormatted,
          ...transfersFromFormatted,
          ...transfersToFormatted
        ]);

        console.log('✅ useAccountTransactions - Final transaction count:', allTransactions?.length || 0);
        console.log('✅ useAccountTransactions - Returning transactions:', allTransactions);
        
        return allTransactions;
      } catch (error) {
        console.error('❌ useAccountTransactions - Error in query:', error);
        throw error;
      }
    },
    enabled: !!accountId && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache para transacciones
    gcTime: 10 * 60 * 1000, // 10 minutos en garbage collection
    refetchOnMount: true,
    retry: 2
  });
}
