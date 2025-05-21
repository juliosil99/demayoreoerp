
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface TopSku {
  sku: string;
  productName: string;
  quantity: number;
  revenue: number;
  change: number;
}

export const useTopSkusByUnits = (dateRange?: DateRange) => {
  const [topSkus, setTopSkus] = useState<TopSku[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopSkus = async () => {
      setLoading(true);
      try {
        if (!dateRange?.from || !dateRange?.to) {
          setTopSkus([]);
          return;
        }

        // Generate previous date range of same duration for comparison
        const currentFrom = dateRange.from;
        const currentTo = dateRange.to || dateRange.from;
        
        const diffTime = Math.abs(currentTo.getTime() - currentFrom.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        const previousFrom = new Date(currentFrom);
        previousFrom.setDate(previousFrom.getDate() - diffDays);
        
        const previousTo = new Date(previousFrom);
        previousTo.setDate(previousTo.getDate() + diffDays - 1);

        // Fetch current period data
        const { data: currentData, error: currentError } = await supabase
          .from("Sales")
          .select("sku, productName, Quantity, price")
          .gte("date", format(currentFrom, "yyyy-MM-dd"))
          .lte("date", format(currentTo, "yyyy-MM-dd"))
          .not("sku", "is", null)
          .order("sku");

        if (currentError) throw currentError;

        // Fetch previous period data for comparison
        const { data: previousData, error: previousError } = await supabase
          .from("Sales")
          .select("sku, Quantity")
          .gte("date", format(previousFrom, "yyyy-MM-dd"))
          .lte("date", format(previousTo, "yyyy-MM-dd"))
          .not("sku", "is", null)
          .order("sku");

        if (previousError) throw previousError;

        // Process and aggregate the data
        const skuMap = new Map<
          string,
          { sku: string; productName: string; quantity: number; revenue: number; prevQuantity: number }
        >();

        // Process current period data
        currentData.forEach((sale) => {
          const sku = sale.sku || "unknown";
          const quantity = Number(sale.Quantity) || 0;
          const price = Number(sale.price) || 0;
          
          if (!skuMap.has(sku)) {
            skuMap.set(sku, {
              sku,
              productName: sale.productName || "Unknown Product",
              quantity: 0,
              revenue: 0,
              prevQuantity: 0,
            });
          }
          
          const skuData = skuMap.get(sku)!;
          skuData.quantity += quantity;
          skuData.revenue += price;
        });

        // Process previous period data for comparison
        previousData.forEach((sale) => {
          const sku = sale.sku || "unknown";
          const quantity = Number(sale.Quantity) || 0;
          
          if (!skuMap.has(sku)) {
            // If this SKU was sold in previous period but not in current period,
            // we don't include it in our top list
            return;
          }
          
          const skuData = skuMap.get(sku)!;
          skuData.prevQuantity += quantity;
        });

        // Calculate percentage change and sort by quantity
        const processedData: TopSku[] = Array.from(skuMap.values())
          .map((item) => {
            let change = 0;
            if (item.prevQuantity > 0) {
              change = Math.round(((item.quantity - item.prevQuantity) / item.prevQuantity) * 100);
            } else if (item.quantity > 0) {
              change = 100; // New item, 100% increase
            }
            return {
              sku: item.sku,
              productName: item.productName,
              quantity: item.quantity,
              revenue: item.revenue,
              change,
            };
          })
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 50); // Get top 50

        setTopSkus(processedData);
      } catch (error) {
        console.error("Error fetching top SKUs:", error);
        toast.error("Error al cargar datos de SKUs");
        setTopSkus([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSkus();
  }, [dateRange]);

  return { topSkus, loading };
};
