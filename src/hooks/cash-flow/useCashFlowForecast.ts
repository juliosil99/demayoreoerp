
import { useForecastQueries } from './useForecastQueries';
import { useForecastMutations } from './useForecastMutations';
import { useWeekMutations } from './useWeekMutations';
import { useItemMutations } from './useItemMutations';
import { useAIForecastGeneration } from './useAIForecastGeneration';

export function useCashFlowForecast(forecastId?: string) {
  // Get forecast data and queries
  const { 
    forecast, 
    weeks, 
    items, 
    isLoading, 
    error, 
    refreshAllForecastData,
    SUPABASE_URL
  } = useForecastQueries(forecastId);
  
  // Get forecast mutations
  const { 
    createForecast, 
    updateForecast, 
    deleteForecast 
  } = useForecastMutations(forecastId);
  
  // Get week mutations
  const { updateWeek } = useWeekMutations(forecastId);
  
  // Get item mutations
  const { upsertItem, deleteItem } = useItemMutations(forecastId);
  
  // Get AI forecast generation
  const { isGenerating, generateAIForecast } = useAIForecastGeneration(
    forecastId,
    refreshAllForecastData
  );
  
  return {
    forecast,
    weeks,
    items,
    isLoading,
    isGenerating,
    error,
    createForecast,
    generateAIForecast,
    updateForecast,
    deleteForecast,
    updateWeek,
    upsertItem,
    deleteItem,
    refreshAllForecastData,
    SUPABASE_URL
  };
}
