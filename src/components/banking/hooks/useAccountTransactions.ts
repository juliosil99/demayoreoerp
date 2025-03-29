
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type AccountTransaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'in' | 'out';
  reference: string;
  source: 'expense' | 'payment' | 'transfer';
  source_id: string;
  // Add additional fields for currency transactions
  exchange_rate?: number;
  original_amount?: number;
  original_currency?: string;
};

export function useAccountTransactions(accountId: number | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['account-transactions', accountId],
    queryFn: async (): Promise<AccountTransaction[]> => {
      if (!accountId || !user?.id) {
        return [];
      }

      // Fetch expenses (outflows)
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('id, date, description, amount, reference_number, chart_accounts:chart_account_id(name)')
        .eq('account_id', accountId)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (expensesError) {
        toast.error('Error al cargar los gastos');
        throw expensesError;
      }

      // Fetch payments (inflows)
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, date, amount, reference_number, notes, clients:client_id(name)')
        .eq('account_id', accountId)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (paymentsError) {
        toast.error('Error al cargar los pagos');
        throw paymentsError;
      }

      // Fetch transfers where this account is source of the transfer (outflows)
      // Including exchange rate information
      const { data: transfersFrom, error: transfersFromError } = await supabase
        .from('account_transfers')
        .select(`
          id, 
          date, 
          amount_from, 
          amount_to,
          exchange_rate,
          reference_number, 
          notes, 
          to_account_id,
          bank_accounts!account_transfers_to_account_id_fkey(name, currency)
        `)
        .eq('from_account_id', accountId)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transfersFromError) {
        toast.error('Error al cargar las transferencias salientes');
        throw transfersFromError;
      }

      // Fetch transfers where this account is destination of the transfer (inflows)
      const { data: transfersTo, error: transfersToError } = await supabase
        .from('account_transfers')
        .select(`
          id, 
          date, 
          amount_from,
          amount_to,
          exchange_rate,
          reference_number, 
          notes, 
          from_account_id,
          bank_accounts!fk_from_account(name, currency)
        `)
        .eq('to_account_id', accountId)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transfersToError) {
        toast.error('Error al cargar las transferencias entrantes');
        throw transfersToError;
      }

      // Fetch the current account to know its currency
      const { data: accountData, error: accountError } = await supabase
        .from('bank_accounts')
        .select('currency')
        .eq('id', accountId)
        .single();

      if (accountError) {
        console.error('Error al cargar la información de la cuenta');
        throw accountError;
      }

      const accountCurrency = accountData?.currency || 'MXN';

      // Transform data to unified format
      const expensesFormatted: AccountTransaction[] = (expenses || []).map(expense => ({
        id: expense.id,
        date: expense.date,
        description: expense.description,
        amount: expense.amount,
        type: 'out',
        reference: expense.reference_number || '-',
        source: 'expense',
        source_id: expense.id
      }));

      const paymentsFormatted: AccountTransaction[] = (payments || []).map(payment => ({
        id: payment.id,
        date: payment.date,
        description: payment.notes || `Pago de ${payment.clients?.name || 'Cliente'}`,
        amount: payment.amount,
        type: 'in',
        reference: payment.reference_number || '-',
        source: 'payment',
        source_id: payment.id
      }));

      // Transform transfers with the correct relationship path and exchange rate info
      const transfersFromFormatted: AccountTransaction[] = (transfersFrom || []).map(transfer => {
        // Get the to_account name using the properly specified foreign key relationship
        const toAccountName = transfer.bank_accounts?.name || 'otra cuenta';
        const toCurrency = transfer.bank_accounts?.currency || 'MXN';
        const isCrossCurrency = toCurrency !== accountCurrency;
        
        // For outgoing transfers, use the amount_from
        return {
          id: transfer.id,
          date: transfer.date,
          description: isCrossCurrency 
            ? `Transferencia a ${toAccountName} (${toCurrency})`
            : `Transferencia a ${toAccountName}`,
          amount: transfer.amount_from,
          type: 'out',
          reference: transfer.reference_number || '-',
          source: 'transfer',
          source_id: transfer.id,
          exchange_rate: transfer.exchange_rate || undefined,
          original_amount: isCrossCurrency ? transfer.amount_to : undefined,
          original_currency: isCrossCurrency ? toCurrency : undefined
        };
      });

      const transfersToFormatted: AccountTransaction[] = (transfersTo || []).map(transfer => {
        // Get the from_account name using the properly specified foreign key relationship
        const fromAccountName = transfer.bank_accounts?.name || 'otra cuenta';
        const fromCurrency = transfer.bank_accounts?.currency || 'MXN';
        const isCrossCurrency = fromCurrency !== accountCurrency;
        
        // For incoming transfers, use the amount_to
        return {
          id: transfer.id,
          date: transfer.date,
          description: isCrossCurrency 
            ? `Transferencia de ${fromAccountName} (${fromCurrency})`
            : `Transferencia de ${fromAccountName}`,
          amount: transfer.amount_to,
          type: 'in',
          reference: transfer.reference_number || '-',
          source: 'transfer',
          source_id: transfer.id,
          exchange_rate: transfer.exchange_rate || undefined,
          original_amount: isCrossCurrency ? transfer.amount_from : undefined,
          original_currency: isCrossCurrency ? fromCurrency : undefined
        };
      });

      // Combine all transactions and sort by date (newest first)
      const allTransactions = [
        ...expensesFormatted,
        ...paymentsFormatted,
        ...transfersFromFormatted,
        ...transfersToFormatted
      ].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      return allTransactions;
    },
    enabled: !!accountId && !!user?.id,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0 // Consider data stale immediately
  });
}
