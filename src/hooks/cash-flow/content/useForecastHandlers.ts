
import { useForecastEventHandlers } from "@/hooks/cash-flow/useForecastEventHandlers";
import { ForecastItem } from "@/types/cashFlow";

interface ForecastHandlersProps {
  selectedForecastId?: string;
  refreshAllForecastData: () => Promise<void>;
  SUPABASE_URL: string;
  createForecastMutation: any;
  refetchForecasts: any;
  setSelectedForecastId: (id: string) => void;
  generateAIForecast: any;
  updateForecast: any;
  upsertItem: any;
  historicalData: any;
}

export function useForecastHandlers({
  selectedForecastId,
  refreshAllForecastData,
  SUPABASE_URL,
  createForecastMutation,
  refetchForecasts,
  setSelectedForecastId,
  generateAIForecast,
  updateForecast,
  upsertItem,
  historicalData
}: ForecastHandlersProps) {
  
  const {
    handleCreateForecast,
    handleGenerateForecast,
    handleSaveItem,
    handleSaveOpenAIKey
  } = useForecastEventHandlers({
    selectedForecastId,
    refreshAllForecastData,
    SUPABASE_URL,
    createForecastMutation, 
    refetchForecasts,
    setSelectedForecastId,
    generateAIForecast,
    updateForecast,
    upsertItem,
    historicalData
  });
  
  // Handlers
  const onCreateForecast = async (name: string, startDate: Date) => {
    console.log("[DEBUG] CashFlowForecast - Creating forecast:", { name, startDate });
    try {
      const result = await handleCreateForecast(name, startDate);
      console.log("[DEBUG] CashFlowForecast - Forecast created:", result);
      return { success: true, result };
    } catch (error) {
      console.error("[DEBUG] CashFlowForecast - Error creating forecast:", error);
      return { success: false, error };
    }
  };
  
  const onGenerateForecast = async (options: Record<string, any>) => {
    console.log("[DEBUG] CashFlowForecast - Generating forecast with options:", options);
    await handleGenerateForecast(options);
    console.log("[DEBUG] CashFlowForecast - Forecast generation completed");
    return true;
  };
  
  const onSaveItem = async (item: Partial<ForecastItem>) => {
    console.log("[DEBUG] CashFlowForecast - Saving item:", item);
    const success = await handleSaveItem(item);
    console.log("[DEBUG] CashFlowForecast - Item saved:", success);
    return success;
  };
  
  const onSaveOpenAIKey = async (apiKey: string) => {
    console.log("[DEBUG] CashFlowForecast - Saving OpenAI key");
    const success = await handleSaveOpenAIKey(apiKey);
    console.log("[DEBUG] CashFlowForecast - OpenAI key saved:", success);
    
    if (success && selectedForecastId) {
      console.log("[DEBUG] CashFlowForecast - Generating forecast with new API key");
      await generateAIForecast(historicalData);
      await refreshAllForecastData();
    }
    
    return success;
  };

  return {
    onCreateForecast,
    onGenerateForecast,
    onSaveItem,
    onSaveOpenAIKey
  };
}
