
import { toast } from "sonner";

interface ForecastCreationHandlerProps {
  refreshAllForecastData: () => Promise<void>;
  createForecastMutation: any;
  refetchForecasts: any;
  setSelectedForecastId: (id: string) => void;
}

export function useForecastCreationHandler({
  refreshAllForecastData,
  createForecastMutation,
  refetchForecasts,
  setSelectedForecastId
}: ForecastCreationHandlerProps) {
  
  const handleCreateForecast = async (name: string, startDate: Date) => {
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

  return { handleCreateForecast };
}
