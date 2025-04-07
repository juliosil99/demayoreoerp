
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CashFlowForecast, ForecastWeek, ForecastItem } from "@/types/cashFlow";

// Constant for the Supabase URL
const SUPABASE_URL = "https://dulmmxtkgqkcfovvfxzu.supabase.co";

export function useForecastQueries(forecastId?: string) {
  // Fetch forecast details
  const { 
    data: forecast, 
    isLoading: isLoadingForecast,
    error: forecastError,
    refetch: refetchForecast
  } = useQuery({
    queryKey: ['cash-flow-forecast', forecastId],
    queryFn: async () => {
      if (!forecastId) return null;
      
      const { data, error } = await supabase
        .from('cash_flow_forecasts')
        .select('*')
        .eq('id', forecastId)
        .single();
        
      if (error) throw error;
      return data as CashFlowForecast;
    },
    enabled: !!forecastId
  });
  
  // Fetch forecast weeks
  const { 
    data: weeks, 
    isLoading: isLoadingWeeks,
    error: weeksError,
    refetch: refetchWeeks
  } = useQuery({
    queryKey: ['cash-flow-forecast-weeks', forecastId],
    queryFn: async () => {
      if (!forecastId) return [];
      
      const { data, error } = await supabase
        .from('forecast_weeks')
        .select('*')
        .eq('forecast_id', forecastId)
        .order('week_number', { ascending: true });
        
      if (error) throw error;
      
      // Calculate derived values
      let cumulativeCashFlow = 0;
      const processedWeeks = (data as ForecastWeek[]).map(week => {
        const netCashFlow = week.predicted_inflows - week.predicted_outflows;
        cumulativeCashFlow += netCashFlow;
        
        return {
          ...week,
          net_cash_flow: netCashFlow,
          cumulative_cash_flow: cumulativeCashFlow
        };
      });
      
      return processedWeeks;
    },
    enabled: !!forecastId
  });
  
  // Fetch forecast items
  const { 
    data: items, 
    isLoading: isLoadingItems,
    error: itemsError,
    refetch: refetchItems
  } = useQuery({
    queryKey: ['cash-flow-forecast-items', forecastId],
    queryFn: async () => {
      if (!forecastId) return [];
      
      const { data, error } = await supabase
        .from('forecast_items')
        .select('*')
        .eq('forecast_id', forecastId);
        
      if (error) throw error;
      return data as ForecastItem[];
    },
    enabled: !!forecastId
  });

  // Function to force refresh all forecast data
  const refreshAllForecastData = async () => {
    if (!forecastId) return;
    
    await Promise.all([
      refetchForecast(),
      refetchWeeks(),
      refetchItems()
    ]);
  };

  return {
    forecast,
    weeks,
    items,
    isLoading: isLoadingForecast || isLoadingWeeks || isLoadingItems,
    error: forecastError || weeksError || itemsError,
    refetchForecast,
    refetchWeeks,
    refetchItems,
    refreshAllForecastData,
    SUPABASE_URL
  };
}
