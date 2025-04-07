
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ForecastItem } from "@/types/cashFlow";

export function useItemMutations(forecastId?: string) {
  const queryClient = useQueryClient();

  // Create or update a forecast item
  const upsertItem = useMutation({
    mutationFn: async (item: Partial<ForecastItem> & { id?: string }) => {
      if (item.id) {
        // Update
        const { error } = await supabase
          .from('forecast_items')
          .update({
            category: item.category || '',
            amount: item.amount || 0,
            description: item.description,
            is_recurring: item.is_recurring,
            confidence_score: item.confidence_score,
            type: item.type || 'inflow',
            source: item.source || 'manual',
            week_id: item.week_id || ''
          })
          .eq('id', item.id);
          
        if (error) throw error;
      } else {
        // Create
        if (!forecastId) throw new Error('No forecast ID provided');
        
        const { error } = await supabase
          .from('forecast_items')
          .insert({
            forecast_id: forecastId,
            week_id: item.week_id || '',
            category: item.category || '',
            amount: item.amount || 0,
            description: item.description,
            is_recurring: item.is_recurring,
            confidence_score: item.confidence_score,
            type: item.type || 'inflow',
            source: item.source || 'manual'
          });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-items', forecastId] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-weeks', forecastId] });
    }
  });
  
  // Delete a forecast item
  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('forecast_items')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-items', forecastId] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-weeks', forecastId] });
    }
  });

  return {
    upsertItem,
    deleteItem
  };
}
