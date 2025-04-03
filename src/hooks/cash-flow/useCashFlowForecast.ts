
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CashFlowForecast, ForecastWeek, ForecastItem, ForecastHistoricalData, ForecastResponse } from "@/types/cashFlow";
import { format, addDays } from "date-fns";

export function useCashFlowForecast(forecastId?: string) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Fetch forecast details
  const { 
    data: forecast, 
    isLoading: isLoadingForecast,
    error: forecastError
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
    error: weeksError
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
    error: itemsError
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
          status: 'draft'
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
  
  // Generate forecast with AI
  const generateAIForecast = async (historicalData: ForecastHistoricalData, config?: Record<string, any>) => {
    if (!forecastId) return null;
    
    setIsGenerating(true);
    
    try {
      // Get the forecast start date
      const { data: forecastData, error: forecastError } = await supabase
        .from('cash_flow_forecasts')
        .select('start_date')
        .eq('id', forecastId)
        .single();
        
      if (forecastError) throw forecastError;
      
      // Call the Edge Function to generate the forecast
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cash-flow-forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          forecastId,
          startDate: forecastData.start_date,
          historicalData,
          config
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate forecast: ${errorText}`);
      }
      
      const data = await response.json() as ForecastResponse;
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error generating forecast');
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast', forecastId] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-weeks', forecastId] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-items', forecastId] });
      
      return data;
    } catch (error) {
      console.error('Error generating forecast:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
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
  
  // Update a week
  const updateWeek = useMutation({
    mutationFn: async ({ weekId, data }: { weekId: string, data: Partial<ForecastWeek> }) => {
      const { error } = await supabase
        .from('forecast_weeks')
        .update(data)
        .eq('id', weekId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-weeks', forecastId] });
    }
  });
  
  // Create or update a forecast item
  const upsertItem = useMutation({
    mutationFn: async (item: Partial<ForecastItem> & { id?: string }) => {
      if (item.id) {
        // Update
        const { error } = await supabase
          .from('forecast_items')
          .update(item)
          .eq('id', item.id);
          
        if (error) throw error;
      } else {
        // Create
        if (!forecastId) throw new Error('No forecast ID provided');
        
        const { error } = await supabase
          .from('forecast_items')
          .insert({
            ...item,
            forecast_id: forecastId
          });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-items', forecastId] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-weeks', forecastId] });
    }
  });
  
  // Delete a forecast item
  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('forecast_items')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-items', forecastId] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-weeks', forecastId] });
    }
  });
  
  return {
    forecast,
    weeks,
    items,
    isLoading: isLoadingForecast || isLoadingWeeks || isLoadingItems,
    isGenerating,
    error: forecastError || weeksError || itemsError,
    createForecast,
    generateAIForecast,
    updateForecast,
    deleteForecast,
    updateWeek,
    upsertItem,
    deleteItem
  };
}
