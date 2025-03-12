
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
      const { data: transfersFrom, error: transfersFromError } = await supabase
        .from('account_transfers')
        .select(`
          id, 
          date, 
          amount, 
          reference_number, 
          notes, 
          to_account_id,
          bank_accounts!to_account_id(name)
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
          amount, 
          reference_number, 
          notes, 
          from_account_id,
          bank_accounts!from_account_id(name)
        `)
        .eq('to_account_id', accountId)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transfersToError) {
        toast.error('Error al cargar las transferencias entrantes');
        throw transfersToError;
      }

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

      // Transform transfers with properly hinted column names
      const transfersFromFormatted: AccountTransaction[] = (transfersFrom || []).map(transfer => {
        // Get the to_account name using the properly aliased path
        const toAccountName = transfer.bank_accounts?.name || 'otra cuenta';
        
        return {
          id: transfer.id,
          date: transfer.date,
          description: `Transferencia a ${toAccountName}`,
          amount: transfer.amount,
          type: 'out',
          reference: transfer.reference_number || '-',
          source: 'transfer',
          source_id: transfer.id
        };
      });

      const transfersToFormatted: AccountTransaction[] = (transfersTo || []).map(transfer => {
        // Get the from_account name using the properly aliased path
        const fromAccountName = transfer.bank_accounts?.name || 'otra cuenta';
        
        return {
          id: transfer.id,
          date: transfer.date,
          description: `Transferencia de ${fromAccountName}`,
          amount: transfer.amount,
          type: 'in',
          reference: transfer.reference_number || '-',
          source: 'transfer',
          source_id: transfer.id
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
  });
}
