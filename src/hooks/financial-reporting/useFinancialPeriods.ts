
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
        description: `No se pudieron crear los períodos: ${error.message}`,
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
        description: `No se pudo cerrar el período: ${error.message}`,
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
    getCurrentPeriod
  };
}
