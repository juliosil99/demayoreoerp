
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CashFlowForecast } from "@/types/cashFlow";

export function useCashFlowForecasts() {
  const queryClient = useQueryClient();
  
  // Fetch all forecasts
  const { 
    data: forecasts, 
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['cash-flow-forecasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_flow_forecasts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as CashFlowForecast[];
    }
  });
  
  // Create a new forecast
  const createForecast = useMutation({
    mutationFn: async (forecast: { name: string; start_date: string; status: string }) => {
      const { data, error } = await supabase
        .from('cash_flow_forecasts')
        .insert({
          ...forecast,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as CashFlowForecast;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecasts'] });
    }
  });
  
  return {
    forecasts,
    isLoading,
    error,
    createForecast,
    refetch
  };
}
