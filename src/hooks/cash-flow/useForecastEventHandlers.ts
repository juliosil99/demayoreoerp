
import { 
  useForecastCreationHandler,
  useForecastGenerationHandler, 
  useForecastItemHandler,
  useAPIKeyHandler
} from "./forecast-handlers";
import { ForecastItem } from "@/types/cashFlow";

interface ForecastHandlerProps {
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

export function useForecastEventHandlers({
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
}: ForecastHandlerProps) {
  
  // Use smaller handler hooks
  const { handleCreateForecast } = useForecastCreationHandler({
    refreshAllForecastData,
    createForecastMutation,
    refetchForecasts,
    setSelectedForecastId
  });
  
  const { handleGenerateForecast } = useForecastGenerationHandler({
    selectedForecastId,
    refreshAllForecastData,
    generateAIForecast,
    updateForecast,
    historicalData
  });
  
  const { handleSaveItem } = useForecastItemHandler({
    refreshAllForecastData,
    upsertItem
  });
  
  const { handleSaveOpenAIKey } = useAPIKeyHandler({
    SUPABASE_URL
  });

  return {
    handleCreateForecast,
    handleGenerateForecast,
    handleSaveItem,
    handleSaveOpenAIKey
  };
}
