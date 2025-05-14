
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { differenceInDays, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DashboardMetrics } from "@/types/dashboard";

export const useFetchSalesData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchSalesMetrics = useCallback(async (dateRange: DateRange): Promise<Partial<DashboardMetrics>> => {
    if (!dateRange.from || !dateRange.to) {
      return {};
    }

    setIsLoading(true);
    const realData: Partial<DashboardMetrics> = {};

    try {
      // 1. Fetch contribution margin data
      const { data: salesData, error: salesError } = await fetchContributionMargin(dateRange);
      
      if (salesError) {
        console.error("Error fetching sales data for profits:", salesError);
        toast.error("Error al cargar datos de ganancias");
      } else if (salesData) {
        // Calculate contribution margin by summing all Profit values
        realData.contributionMargin = salesData.reduce((sum, sale) => sum + (sale.Profit || 0), 0);
      }

      // 2. Calculate Order Revenue from "price" column
      const { data: revenueData, error: revenueError } = await fetchRevenueData(dateRange);

      if (revenueError) {
        console.error("Error fetching sales data for revenue:", revenueError);
        toast.error("Error al cargar datos de ingresos");
      } else if (revenueData) {
        // Sum the price values
        realData.orderRevenue = revenueData.reduce((sum, sale) => sum + (sale.price || 0), 0);
        
        // Count orders
        realData.orders = revenueData.length;
        
        // Calculate Average Order Value if we have orders
        if (realData.orders > 0) {
          realData.aov = realData.orderRevenue / realData.orders;
        }

        // 3. Calculate the previous period for comparison
        const comparisonData = await fetchComparisonData(dateRange, realData);
        Object.assign(realData, comparisonData);
      }

      return realData;
    } catch (error) {
      console.error("Error in fetchSalesMetrics:", error);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchContributionMargin = async (dateRange: DateRange) => {
    return await supabase
      .from("Sales")
      .select("Profit")
      .gte("date", dateRange.from!.toISOString().split('T')[0])
      .lte("date", dateRange.to!.toISOString().split('T')[0]);
  };

  const fetchRevenueData = async (dateRange: DateRange) => {
    return await supabase
      .from("Sales")
      .select("price")
      .gte("date", dateRange.from!.toISOString().split('T')[0])
      .lte("date", dateRange.to!.toISOString().split('T')[0]);
  };

  const fetchComparisonData = async (
    dateRange: DateRange, 
    currentData: Partial<DashboardMetrics>
  ): Promise<Partial<DashboardMetrics>> => {
    const changes: Partial<DashboardMetrics> = {};
    
    // Calculate previous period date range
    const daysDiff = differenceInDays(dateRange.to!, dateRange.from!) + 1;
    const prevPeriodEnd = subDays(dateRange.from!, 1);
    const prevPeriodStart = subDays(prevPeriodEnd, daysDiff - 1);
    
    const { data: prevRevenueData, error: prevRevenueError } = await supabase
      .from("Sales")
      .select("price")
      .gte("date", prevPeriodStart.toISOString().split('T')[0])
      .lte("date", prevPeriodEnd.toISOString().split('T')[0]);
    
    if (!prevRevenueError && prevRevenueData) {
      const prevRevenue = prevRevenueData.reduce((sum, sale) => sum + (sale.price || 0), 0);
      const prevOrders = prevRevenueData.length;
      const prevAOV = prevOrders > 0 ? prevRevenue / prevOrders : 0;
      
      // Calculate percentage changes
      changes.revenueChange = prevRevenue > 0 
        ? ((currentData.orderRevenue! - prevRevenue) / prevRevenue) * 100
        : 0;
        
      changes.ordersChange = prevOrders > 0 
        ? ((currentData.orders! - prevOrders) / prevOrders) * 100
        : 0;
        
      changes.aovChange = prevAOV > 0 
        ? ((currentData.aov! - prevAOV) / prevAOV) * 100
        : 0;
    }
    
    return changes;
  };

  return { fetchSalesMetrics, isLoading };
};
