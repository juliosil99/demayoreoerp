
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
    console.log("[DEBUG] useAIForecastGeneration - Starting forecast generation for ID:", forecastId);
    console.log("[DEBUG] useAIForecastGeneration - Historical data summary:", {
      payablesCount: historicalData?.payables?.length,
      receivablesCount: historicalData?.receivables?.length,
      expensesCount: historicalData?.expenses?.length,
      salesCount: historicalData?.sales?.length,
      bankAccountsCount: historicalData?.bankAccounts?.length
    });
    console.log("[DEBUG] useAIForecastGeneration - Config:", config);
    
    if (!forecastId) {
      console.error("[DEBUG] useAIForecastGeneration - No forecastId provided");
      return null;
    }
    
    setIsGenerating(true);
    
    try {
      // Get the forecast start date
      console.log("[DEBUG] useAIForecastGeneration - Fetching forecast data");
      const { data: forecastData, error: forecastError } = await supabase
        .from('cash_flow_forecasts')
        .select('start_date')
        .eq('id', forecastId)
        .single();
        
      if (forecastError) {
        console.error("[DEBUG] useAIForecastGeneration - Error fetching forecast:", forecastError);
        throw forecastError;
      }
      
      console.log("[DEBUG] useAIForecastGeneration - Forecast start date:", forecastData.start_date);
      
      // Get auth session for API call
      console.log("[DEBUG] useAIForecastGeneration - Getting auth session");
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      
      if (!accessToken) {
        console.error("[DEBUG] useAIForecastGeneration - No access token available");
        throw new Error("Authentication token not available");
      }
      
      // Call the Edge Function to generate the forecast
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/cash-flow-forecast`;
      console.log("[DEBUG] useAIForecastGeneration - Calling edge function:", edgeFunctionUrl);
      
      const requestBody = {
        forecastId,
        startDate: forecastData.start_date,
        historicalData,
        config
      };
      
      console.log("[DEBUG] useAIForecastGeneration - Request payload:", JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log("[DEBUG] useAIForecastGeneration - Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DEBUG] useAIForecastGeneration - API Error Response:", errorText);
        throw new Error(`Failed to generate forecast: ${errorText}`);
      }
      
      const data = await response.json() as ForecastResponse;
      console.log("[DEBUG] useAIForecastGeneration - API Response:", data);
      
      if (!data.success) {
        console.error("[DEBUG] useAIForecastGeneration - API Error:", data.error);
        throw new Error(data.error || 'Unknown error generating forecast');
      }
      
      // Forcing refetch of all data
      if (refreshAllForecastData) {
        console.log("[DEBUG] useAIForecastGeneration - Refreshing all forecast data");
        await refreshAllForecastData();
      }
      
      // Additionally invalidate queries
      console.log("[DEBUG] useAIForecastGeneration - Invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast', forecastId] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-weeks', forecastId] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-items', forecastId] });
      
      console.log("[DEBUG] useAIForecastGeneration - Forecast generation completed successfully");
      return data;
    } catch (error) {
      console.error('[DEBUG] useAIForecastGeneration - Error generating forecast:', error);
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
