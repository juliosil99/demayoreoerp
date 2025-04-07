
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ForecastHistoricalData, ForecastResponse } from "@/types/cashFlow";
import { toast } from "sonner";

// Get the Supabase URL from the environment or use a fallback
const SUPABASE_URL = "https://dulmmxtkgqkcfovvfxzu.supabase.co";

export function useAIForecastGeneration(
  forecastId?: string,
  refreshAllForecastData?: () => Promise<void>
) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

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
      const response = await fetch(`${SUPABASE_URL}/functions/v1/cash-flow-forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
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
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to generate forecast: ${errorText}`);
      }
      
      const data = await response.json() as ForecastResponse;
      
      if (!data.success) {
        console.error("API Error Response:", data.error);
        throw new Error(data.error || 'Unknown error generating forecast');
      }
      
      // Forcing refetch of all data
      if (refreshAllForecastData) {
        await refreshAllForecastData();
      }
      
      // Additionally invalidate queries
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast', forecastId] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-weeks', forecastId] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-items', forecastId] });
      
      return data;
    } catch (error) {
      console.error('Error generating forecast:', error);
      toast.error(`Error al generar el pronóstico: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateAIForecast
  };
}
