
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface OptimizedTopSku {
  sku: string;
  product_name: string;
  quantity: number;
  revenue: number;
  change_percentage: number;
}

export const useOptimizedTopSkusByUnits = (dateRange?: DateRange) => {
  const [topSkus, setTopSkus] = useState<OptimizedTopSku[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTopSkus = async () => {
      if (!user?.id) {
        setTopSkus([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        if (!dateRange?.from || !dateRange?.to) {
          setTopSkus([]);
          return;
        }

        const startDate = format(dateRange.from, "yyyy-MM-dd");
        const endDate = format(dateRange.to, "yyyy-MM-dd");

        // Llamar a la función optimizada de la base de datos
        const { data, error } = await supabase.rpc('get_top_skus_by_units', {
          p_user_id: user.id,
          p_start_date: startDate,
          p_end_date: endDate
        });

        if (error) {
          console.error("Error fetching top SKUs:", error);
          throw error;
        }

        // Transformar los datos para que coincidan con la interfaz esperada
        const transformedData: OptimizedTopSku[] = (data || []).map((item: any) => ({
          sku: item.sku,
          product_name: item.product_name,
          quantity: Number(item.quantity),
          revenue: Number(item.revenue),
          change_percentage: Number(item.change_percentage)
        }));

        setTopSkus(transformedData);
      } catch (error) {
        console.error("Error fetching top SKUs:", error);
        toast.error("Error al cargar datos de SKUs");
        setTopSkus([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSkus();
  }, [dateRange, user?.id]);

  return { topSkus, loading };
};
