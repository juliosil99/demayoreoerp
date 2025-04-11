
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ForecastItem } from "@/types/cashFlow";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

export function useForecastOperations(
  forecastId: string | undefined,
  refreshAllForecastData: () => Promise<void>,
  SUPABASE_URL: string
) {
  const handleCreateForecast = async (
    createForecastMutation: any,
    refetchForecasts: (options?: RefetchOptions) => Promise<QueryObserverResult<any, Error>>,
    setSelectedForecastId: (id: string) => void,
    name: string, 
    startDate: Date
  ) => {
    console.log("[DEBUG] useForecastOperations - Creating forecast:", { name, startDate });
    try {
      const result = await createForecastMutation.mutateAsync({
        name,
        start_date: startDate.toISOString().split('T')[0],
        status: 'draft'
      });
      
      console.log("[DEBUG] useForecastOperations - Forecast created:", result);
      setSelectedForecastId(result.id);
      toast.success('Pronóstico creado correctamente');
      
      await refetchForecasts();
      return result;
    } catch (error) {
      console.error('[DEBUG] useForecastOperations - Error creating forecast:', error);
      toast.error('Error al crear el pronóstico');
      throw error;
    }
  };
  
  const handleGenerateForecast = async (
    generateAIForecast: any,
    updateForecast: any,
    historicalData: any,
    options: Record<string, any>
  ) => {
    console.log("[DEBUG] useForecastOperations - Generating forecast with ID:", forecastId);
    console.log("[DEBUG] useForecastOperations - Options:", options);
    
    if (!forecastId) {
      console.error("[DEBUG] useForecastOperations - No forecastId provided");
      return;
    }
    
    try {
      console.log("[DEBUG] useForecastOperations - Calling generateAIForecast");
      await generateAIForecast(historicalData, options);
      
      console.log("[DEBUG] useForecastOperations - Updating forecast status to active");
      await updateForecast.mutateAsync({
        status: 'active'
      });
      
      toast.success('Pronóstico generado correctamente');
      console.log("[DEBUG] useForecastOperations - Forecast generation successful");
      
      await refreshAllForecastData();
    } catch (error) {
      console.error('[DEBUG] useForecastOperations - Error generating forecast:', error);
      toast.error('Error al generar el pronóstico');
    }
  };

  const handleSaveItem = async (
    upsertItem: any,
    item: Partial<ForecastItem>
  ) => {
    console.log("[DEBUG] useForecastOperations - Saving item:", item);
    try {
      await upsertItem.mutateAsync(item);
      toast.success('Elemento guardado correctamente');
      console.log("[DEBUG] useForecastOperations - Item saved successfully");
      
      await refreshAllForecastData();
      return true;
    } catch (error) {
      console.error('[DEBUG] useForecastOperations - Error saving item:', error);
      toast.error('Error al guardar el elemento');
      return false;
    }
  };
  
  const handleSaveOpenAIKey = async (apiKey: string) => {
    console.log("[DEBUG] useForecastOperations - Saving OpenAI API Key");
    try {
      // Get auth session for API call
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      
      if (!accessToken) {
        console.error("[DEBUG] useForecastOperations - No access token available");
        throw new Error("Authentication token not available");
      }
      
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/set-api-key`;
      console.log("[DEBUG] useForecastOperations - Calling edge function:", edgeFunctionUrl);
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ apiKey })
      });
      
      console.log("[DEBUG] useForecastOperations - Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DEBUG] useForecastOperations - API Error Response:", errorText);
        throw new Error(`Failed to save API key: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("[DEBUG] useForecastOperations - API Response:", data);
      
      if (!data.success) {
        console.error("[DEBUG] useForecastOperations - API Error:", data.error);
        throw new Error(data.error || 'Unknown error saving API key');
      }
      
      toast.success('API Key guardada correctamente');
      return true;
    } catch (error) {
      console.error('[DEBUG] useForecastOperations - Error saving API key:', error);
      toast.error(`Error al guardar API key: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return false;
    }
  };

  return {
    handleCreateForecast,
    handleGenerateForecast,
    handleSaveItem,
    handleSaveOpenAIKey
  };
}
