
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { ForecastItem } from "@/types/cashFlow";

export function useForecastOperations(
  forecastId: string | undefined,
  refreshAllForecastData: () => Promise<void>,
  SUPABASE_URL: string
) {
  const handleCreateForecast = async (
    createForecastMutation: any,
    refetchForecasts: () => Promise<void>,
    setSelectedForecastId: (id: string) => void,
    name: string, 
    startDate: Date
  ) => {
    try {
      const result = await createForecastMutation.mutateAsync({
        name,
        start_date: startDate.toISOString().split('T')[0],
        status: 'draft'
      });
      
      setSelectedForecastId(result.id);
      toast.success('Pronóstico creado correctamente');
      
      await refetchForecasts();
      return result;
    } catch (error) {
      console.error('Error creating forecast:', error);
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
    if (!forecastId) return;
    
    try {
      await generateAIForecast(historicalData, options);
      
      await updateForecast.mutateAsync({
        status: 'active'
      });
      
      toast.success('Pronóstico generado correctamente');
      
      await refreshAllForecastData();
    } catch (error) {
      console.error('Error generating forecast:', error);
      toast.error('Error al generar el pronóstico');
    }
  };

  const handleSaveItem = async (
    upsertItem: any,
    item: Partial<ForecastItem>
  ) => {
    try {
      await upsertItem.mutateAsync(item);
      toast.success('Elemento guardado correctamente');
      
      await refreshAllForecastData();
      return true;
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Error al guardar el elemento');
      return false;
    }
  };
  
  const handleSaveOpenAIKey = async (apiKey: string) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/set-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ apiKey })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save API key: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error saving API key');
      }
      
      toast.success('API Key guardada correctamente');
      return true;
    } catch (error) {
      console.error('Error saving API key:', error);
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
