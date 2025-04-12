
import { toast } from "sonner";
import { format, addDays } from "date-fns";

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
    console.log("[DEBUG] useForecastOperations - Generating rolling forecast with ID:", selectedForecastId);
    console.log("[DEBUG - Balance Tracking] useForecastGenerationHandler - options:", options);
    console.log("[DEBUG - Balance Tracking] useForecastGenerationHandler - historicalData balances:", {
      availableCashBalance: historicalData?.availableCashBalance,
      creditLiabilities: historicalData?.creditLiabilities,
      netPosition: historicalData?.netPosition,
      balanceHistoryEntries: historicalData?.balance_history?.length
    });
    
    if (!selectedForecastId) {
      console.error("[DEBUG] useForecastOperations - No forecastId provided");
      return false;
    }
    
    try {
      // Update forecast with current date as start date (for rolling forecast)
      const today = new Date();
      const startDate = format(today, 'yyyy-MM-dd');
      
      // First update the forecast start date to ensure it's always current
      await updateForecast.mutateAsync({
        start_date: startDate,
        last_updated: format(today, 'yyyy-MM-dd HH:mm:ss')
      });
      
      console.log("[DEBUG] useForecastOperations - Updated forecast start date to current date:", startDate);
      
      // Enhance options with rolling forecast configuration
      const enhancedOptions = {
        ...options,
        useRollingForecast: true,
        forecastHorizonWeeks: 13,
        startDate: startDate,
        balanceConfidenceThresholds: {
          high: 7, // Data within last 7 days is high confidence
          medium: 14 // Data within last 14 days is medium confidence, beyond is low
        }
      };
      
      console.log("[DEBUG] useForecastOperations - Calling generateAIForecast with rolling config");
      const success = await generateAIForecast(historicalData, enhancedOptions);
      
      if (success) {
        console.log("[DEBUG] useForecastOperations - Updating forecast status to active");
        await updateForecast.mutateAsync({
          status: 'active',
          is_rolling: true,
          last_reconciled_date: options.reconcileBalances ? format(today, 'yyyy-MM-dd') : undefined,
          is_balance_confirmed: options.reconcileBalances || false
        });
        
        toast.success('Pronóstico generado correctamente');
        console.log("[DEBUG] useForecastOperations - Rolling forecast generation successful");
        
        await refreshAllForecastData();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[DEBUG] useForecastOperations - Error generating rolling forecast:', error);
      toast.error('Error al generar el pronóstico');
      return false;
    }
  };

  return { handleGenerateForecast };
}
