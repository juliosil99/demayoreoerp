
import { toast } from "sonner";

interface ForecastGenerationHandlerProps {
  selectedForecastId?: string;
  refreshAllForecastData: () => Promise<void>;
  generateAIForecast: any;
  updateForecast: any;
  historicalData: any;
}

export function useForecastGenerationHandler({
  selectedForecastId,
  refreshAllForecastData,
  generateAIForecast,
  updateForecast,
  historicalData
}: ForecastGenerationHandlerProps) {
  
  const handleGenerateForecast = async (options: Record<string, any>) => {
    console.log("[DEBUG] useForecastOperations - Generating forecast with ID:", selectedForecastId);
    console.log("[DEBUG - Balance Tracking] useForecastGenerationHandler - options:", options);
    console.log("[DEBUG - Balance Tracking] useForecastGenerationHandler - historicalData balances:", {
      availableCashBalance: historicalData?.availableCashBalance,
      creditLiabilities: historicalData?.creditLiabilities,
      netPosition: historicalData?.netPosition
    });
    
    if (!selectedForecastId) {
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

  return { handleGenerateForecast };
}
