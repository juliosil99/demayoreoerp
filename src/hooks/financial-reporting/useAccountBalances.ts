
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { AccountBalance } from "@/types/financial-reporting";
import { toast } from "@/components/ui/use-toast";

interface AccountBalanceInput {
  account_id: string;
  period_id: string;
  balance: number;
}

export function useAccountBalances(periodId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch account balances for a specific period
  const { data: balances, isLoading, error } = useQuery({
    queryKey: ['account-balances', periodId, user?.id],
    queryFn: async () => {
      if (!periodId) throw new Error('Period ID is required');
      
      const { data, error } = await supabase
        .from('account_balances')
        .select(`
          *,
          chart_of_accounts:account_id (name, account_type, code)
        `)
        .eq('period_id', periodId)
        .eq('user_id', user?.id);
        
      if (error) throw error;
      return data as unknown as (AccountBalance & { chart_of_accounts: { name: string, account_type: string, code: string } })[];
    },
    enabled: !!periodId && !!user?.id
  });

  // Create or update account balances
  const { mutateAsync: saveAccountBalance } = useMutation({
    mutationFn: async (data: AccountBalanceInput) => {
      try {
        // Check if there's already an account balance record
        const { data: existingBalance, error: fetchError } = await supabase
          .from('account_balances')
          .select('*')
          .eq('account_id', data.account_id)
          .eq('period_id', data.period_id)
          .eq('user_id', user?.id)
          .maybeSingle();
          
        if (fetchError) throw fetchError;
        
        if (existingBalance) {
          // Update existing balance
          const { data: updatedBalance, error: updateError } = await supabase
            .from('account_balances')
            .update({ balance: data.balance })
            .eq('id', existingBalance.id)
            .select()
            .single();
            
          if (updateError) throw updateError;
          return updatedBalance;
        } else {
          // Create new balance record
          const { data: newBalance, error: insertError } = await supabase
            .from('account_balances')
            .insert([{
              account_id: data.account_id,
              period_id: data.period_id,
              balance: data.balance,
              user_id: user?.id
            }])
            .select()
            .single();
            
          if (insertError) throw insertError;
          return newBalance;
        }
      } catch (error) {
        console.error('Error saving account balance:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['account-balances', periodId, user?.id]
      });
      queryClient.invalidateQueries({
        queryKey: ['financial-report']
      });
      toast({
        title: 'Saldo actualizado',
        description: 'El saldo de la cuenta ha sido actualizado correctamente.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo guardar el saldo: ${(error as Error).message}`,
        variant: 'destructive'
      });
    }
  });

  // Calculate total assets, liabilities, and equity
  const calculateSummary = () => {
    if (!balances) return { assets: 0, liabilities: 0, equity: 0 };
    
    const assets = balances
      .filter(b => ['asset', 'current_asset', 'fixed_asset'].includes(b.chart_of_accounts.account_type))
      .reduce((sum, b) => sum + Number(b.balance), 0);
      
    const liabilities = balances
      .filter(b => ['liability', 'current_liability', 'long_term_liability'].includes(b.chart_of_accounts.account_type))
      .reduce((sum, b) => sum + Number(b.balance), 0);
      
    const equity = balances
      .filter(b => b.chart_of_accounts.account_type === 'equity')
      .reduce((sum, b) => sum + Number(b.balance), 0);
      
    return { assets, liabilities, equity };
  };

  return {
    balances,
    isLoading,
    error,
    saveAccountBalance,
    calculateSummary
  };
}
