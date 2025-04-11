
import { toast } from "sonner";
import { ForecastItem } from "@/types/cashFlow";

interface ForecastItemHandlerProps {
  refreshAllForecastData: () => Promise<void>;
  upsertItem: any;
}

export function useForecastItemHandler({
  refreshAllForecastData,
  upsertItem
}: ForecastItemHandlerProps) {
  
  const handleSaveItem = async (item: Partial<ForecastItem>) => {
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

  return { handleSaveItem };
}
