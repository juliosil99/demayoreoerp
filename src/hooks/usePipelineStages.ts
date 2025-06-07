
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PipelineStage } from '@/types/pipeline';

export function usePipelineStages() {
  return useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: async (): Promise<PipelineStage[]> => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('order_index');

      if (error) throw error;
      return data || [];
    },
  });
}
