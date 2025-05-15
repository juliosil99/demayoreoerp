
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface ChannelIncomeStatementProps {
  userId?: string;
  periodId?: string;
}

export function ChannelIncomeStatement({ userId, periodId }: ChannelIncomeStatementProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['channel-income', userId, periodId],
    queryFn: async () => {
      if (!userId || !periodId) return null;
      
      // Use the new RPC function instead of direct query with groupBy
      const { data, error } = await supabase
        .rpc('get_channel_income_by_period', {
          p_user_id: userId,
          p_period_id: periodId
        });
        
      if (error) {
        console.error('Error fetching channel income:', error);
        toast({
          title: "Error loading channel data",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId && !!periodId
  });

  if (isLoading) {
    return <p>Cargando datos por canal...</p>;
  }

  if (error) {
    return <p>Error al cargar datos: {(error as Error).message}</p>;
  }

  if (!data || data.length === 0) {
    return <p>No hay datos disponibles para este período.</p>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Ingresos por Canal</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center border-b pb-2">
            <span className="font-medium">{item.channel || 'Sin Canal'}</span>
            <span>${Number(item.total).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
