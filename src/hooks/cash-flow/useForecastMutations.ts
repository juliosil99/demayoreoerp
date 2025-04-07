
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CashFlowForecast } from "@/types/cashFlow";
import { format, addDays } from "date-fns";

export function useForecastMutations(forecastId?: string) {
  const queryClient = useQueryClient();

  // Create a new forecast
  const createForecast = useMutation({
    mutationFn: async (forecastName: string) => {
      const today = new Date();
      const startDate = format(today, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('cash_flow_forecasts')
        .insert({
          name: forecastName,
          start_date: startDate,
          status: 'draft',
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Create empty weeks
      const weeksToCreate = Array.from({ length: 13 }, (_, i) => {
        const weekStart = addDays(today, i * 7);
        const weekEnd = addDays(weekStart, 6);
        
        return {
          forecast_id: data.id,
          week_number: i + 1,
          week_start_date: format(weekStart, 'yyyy-MM-dd'),
          week_end_date: format(weekEnd, 'yyyy-MM-dd'),
          predicted_inflows: 0,
          predicted_outflows: 0
        };
      });
      
      const { error: weeksError } = await supabase
        .from('forecast_weeks')
        .insert(weeksToCreate);
        
      if (weeksError) throw weeksError;
      
      return data as CashFlowForecast;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecasts'] });
    }
  });
  
  // Update a forecast
  const updateForecast = useMutation({
    mutationFn: async (data: Partial<CashFlowForecast>) => {
      if (!forecastId) throw new Error('No forecast ID provided');
      
      const { error } = await supabase
        .from('cash_flow_forecasts')
        .update(data)
        .eq('id', forecastId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast', forecastId] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecasts'] });
    }
  });
  
  // Delete a forecast
  const deleteForecast = useMutation({
    mutationFn: async () => {
      if (!forecastId) throw new Error('No forecast ID provided');
      
      const { error } = await supabase
        .from('cash_flow_forecasts')
        .delete()
        .eq('id', forecastId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecasts'] });
    }
  });

  return {
    createForecast,
    updateForecast,
    deleteForecast
  };
}
