
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, format, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";
import { FinancialPeriod, FinancialPeriodType } from "@/types/financial-reporting";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

export function useFinancialPeriods(periodType: FinancialPeriodType) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // Fetch financial periods
  const { data: periods, isLoading, error } = useQuery({
    queryKey: ['financial-periods', periodType, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_periods')
        .select('*')
        .eq('user_id', user?.id)
        .eq('period_type', periodType)
        .order('year', { ascending: false })
        .order('period', { ascending: false });
        
      if (error) throw error;
      return data as unknown as FinancialPeriod[];
    },
    enabled: !!user?.id
  });

  // Create initial periods for the current year
  const { mutateAsync: initializePeriods } = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      try {
        if (periodType === 'month') {
          const { error } = await supabase.rpc(
            'create_monthly_periods_for_year',
            {
              user_uuid: user.id,
              year_param: currentYear
            }
          );
          if (error) throw error;
        } else if (periodType === 'quarter') {
          const { error } = await supabase.rpc(
            'create_quarterly_periods_for_year',
            {
              user_uuid: user.id,
              year_param: currentYear
            }
          );
          if (error) throw error;
        } else if (periodType === 'year') {
          const { error } = await supabase.rpc(
            'create_annual_period',
            {
              user_uuid: user.id,
              year_param: currentYear
            }
          );
          if (error) throw error;
        } else if (periodType === 'day') {
          const { error } = await supabase.rpc(
            'create_daily_periods_for_month',
            {
              user_uuid: user.id,
              year_param: currentYear,
              month_param: currentMonth
            }
          );
          if (error) throw error;
        }
        
        // Initialize base chart of accounts if needed
        const { count, error: countError } = await supabase
          .from('chart_of_accounts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (countError) throw countError;
        
        if (count === 0) {
          // Initialize basic chart of accounts
          await supabase.rpc('initialize_base_accounts', { p_user_id: user.id });
        }
        
        return true;
      } catch (error) {
        console.error('Error initializing periods:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['financial-periods', periodType, user?.id]
      });
      toast({ 
        title: "Períodos creados", 
        description: `Los períodos financieros de tipo ${periodType} han sido creados correctamente.` 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `No se pudieron crear los períodos: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  });

  // Initialize account balances for a specific period
  const { mutateAsync: initializeAccountsForPeriod } = useMutation({
    mutationFn: async (periodId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        // Check if accounts already exist for this period
        const { count, error: countError } = await supabase
          .from('account_balances')
          .select('*', { count: 'exact', head: true })
          .eq('period_id', periodId)
          .eq('user_id', user.id);
          
        if (countError) throw countError;
        
        if (count && count > 0) {
          // Accounts already exist for this period
          return { created: false, message: "Balances already exist" };
        }
        
        // Get all accounts for the user
        const { data: accounts, error: accountsError } = await supabase
          .from('chart_of_accounts')
          .select('id')
          .eq('user_id', user.id);
          
        if (accountsError) throw accountsError;
        
        if (!accounts || accounts.length === 0) {
          // Create base accounts first
          await supabase.rpc('initialize_base_accounts', { p_user_id: user.id });
          
          // Get the accounts again
          const { data: newAccounts, error: newAccountsError } = await supabase
            .from('chart_of_accounts')
            .select('id')
            .eq('user_id', user.id);
            
          if (newAccountsError) throw newAccountsError;
          
          if (!newAccounts || newAccounts.length === 0) {
            throw new Error('No se pudieron crear las cuentas base');
          }
          
          accounts.push(...newAccounts);
        }
        
        // Create balance entries with zero values for all accounts
        const balanceEntries = accounts.map(account => ({
          account_id: account.id,
          period_id: periodId,
          balance: 0,
          user_id: user.id
        }));
        
        const { error: insertError } = await supabase
          .from('account_balances')
          .insert(balanceEntries);
          
        if (insertError) throw insertError;
        
        return { created: true, message: "Account balances initialized" };
      } catch (error) {
        console.error('Error initializing account balances:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['account-balances']
      });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `No se pudieron inicializar los saldos: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  });

  // Close a financial period
  const { mutate: closePeriod } = useMutation({
    mutationFn: async (periodId: string) => {
      const { error } = await supabase
        .from('financial_periods')
        .update({ 
          is_closed: true,
          closed_at: new Date().toISOString() 
        })
        .eq('id', periodId);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['financial-periods', periodType, user?.id]
      });
      toast({ 
        title: "Período cerrado", 
        description: "El período financiero ha sido cerrado correctamente."
      });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: `No se pudo cerrar el período: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  });

  // Get the current period
  const getCurrentPeriod = () => {
    if (!periods || periods.length === 0) {
      return null;
    }
    
    const today = new Date();
    const formattedToday = format(today, 'yyyy-MM-dd');
    
    // Find the current period based on date
    return periods.find(period => {
      const startDate = format(parseISO(period.start_date), 'yyyy-MM-dd');
      const endDate = format(parseISO(period.end_date), 'yyyy-MM-dd');
      return formattedToday >= startDate && formattedToday <= endDate;
    }) || periods[0]; // Default to the most recent period if none match
  };

  return {
    periods,
    isLoading,
    error,
    initializePeriods,
    closePeriod,
    getCurrentPeriod,
    initializeAccountsForPeriod
  };
}
