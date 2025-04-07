
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ForecastWeek } from "@/types/cashFlow";

export function useWeekMutations(forecastId?: string) {
  const queryClient = useQueryClient();
  
  // Update a week
  const updateWeek = useMutation({
    mutationFn: async ({ weekId, data }: { weekId: string, data: Partial<ForecastWeek> }) => {
      const { error } = await supabase
        .from('forecast_weeks')
        .update(data)
        .eq('id', weekId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-forecast-weeks', forecastId] });
    }
  });

  return {
    updateWeek
  };
}
