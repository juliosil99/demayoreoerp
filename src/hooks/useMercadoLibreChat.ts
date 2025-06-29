
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Define the type for our metadata structure
interface MercadoLibreMetadata {
  response_time_seconds?: number;
  classification?: {
    complexity?: string;
  };
  product_title?: string;
  [key: string]: any;
}

export const useMercadoLibreInteractions = () => {
  return useQuery({
    queryKey: ['mercadolibre-interactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('type', 'mercadolibre_question')
        .order('interaction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useMercadoLibreStats = () => {
  return useQuery({
    queryKey: ['mercadolibre-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select('metadata')
        .eq('type', 'mercadolibre_question');

      if (error) throw error;

      // Calcular estadísticas
      const interactions = data || [];
      const totalQuestions = interactions.length;
      
      const avgResponseTime = interactions.reduce((acc, curr) => {
        const metadata = curr.metadata as MercadoLibreMetadata;
        const responseTime = metadata?.response_time_seconds || 0;
        return acc + responseTime;
      }, 0) / Math.max(totalQuestions, 1);

      const classifications = interactions.reduce((acc, curr) => {
        const metadata = curr.metadata as MercadoLibreMetadata;
        const complexity = metadata?.classification?.complexity || 'unknown';
        acc[complexity] = (acc[complexity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topProducts = interactions.reduce((acc, curr) => {
        const metadata = curr.metadata as MercadoLibreMetadata;
        const productTitle = metadata?.product_title;
        if (productTitle) {
          acc[productTitle] = (acc[productTitle] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      return {
        totalQuestions,
        avgResponseTime: Math.round(avgResponseTime),
        classifications,
        topProducts: Object.entries(topProducts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      };
    },
  });
};
