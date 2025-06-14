
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface OptimizedSale {
  id: number;
  date: string;
  price: number;
  profit: number;
  orderNumber: string;
  channel: string;
  productName: string;
  quantity: number;
}

export function useOptimizedSalesData(dateRange: DateRange | undefined) {
  const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
  const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

  return useQuery({
    queryKey: ['optimized-sales-data', startDate, endDate],
    queryFn: async (): Promise<OptimizedSale[]> => {
      // Select only essential columns to reduce data transfer
      const { data, error } = await supabase
        .from('Sales')
        .select(`
          id,
          date,
          price,
          Profit,
          orderNumber,
          Channel,
          productName,
          Quantity
        `)
        .gte('date', startDate || '2024-01-01')
        .lte('date', endDate || '2024-12-31')
        .order('date', { ascending: false })
        .limit(1000); // Limit to 1000 records to reduce transfer

      if (error) throw error;

      return data?.map(sale => ({
        id: sale.id,
        date: sale.date,
        price: Number(sale.price || 0),
        profit: Number(sale.Profit || 0),
        orderNumber: sale.orderNumber || '',
        channel: sale.Channel || 'Sin Canal',
        productName: sale.productName || '',
        quantity: Number(sale.Quantity || 0)
      })) || [];
    },
    enabled: !!startDate && !!endDate,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  });
}
