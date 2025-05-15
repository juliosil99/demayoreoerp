
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ChannelIncomeStatementProps {
  userId?: string;
  periodId?: string;
}

export function ChannelIncomeStatement({ userId, periodId }: ChannelIncomeStatementProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['channel-income', userId, periodId],
    queryFn: async () => {
      if (!userId || !periodId) return null;
      
      // Fetch channel income data
      const { data, error } = await supabase
        .from('Sales')
        .select('Channel, sum(price) as total')
        .eq('user_id', userId)
        // Additional period filtering would go here based on the periodId
        .groupBy('Channel')
        .order('total', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId && !!periodId
  });

  if (isLoading) {
    return <p>Cargando datos por canal...</p>;
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
            <span className="font-medium">{item.Channel || 'Sin Canal'}</span>
            <span>${Number(item.total).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
