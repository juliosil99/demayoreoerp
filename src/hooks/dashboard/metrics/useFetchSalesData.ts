
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

      // 2. Calculate Order Revenue from "price" column and count unique order numbers
      const { data: revenueData, error: revenueError } = await fetchRevenueData(dateRange);

      if (revenueError) {
        console.error("Error fetching sales data for revenue:", revenueError);
        toast.error("Error al cargar datos de ingresos");
      } else if (revenueData) {
        // Sum the price values
        realData.orderRevenue = revenueData.reduce((sum, sale) => sum + (sale.price || 0), 0);
        
        // Count unique order numbers instead of all records
        const uniqueOrderNumbers = new Set();
        revenueData.forEach(sale => {
          if (sale.orderNumber) {
            uniqueOrderNumbers.add(sale.orderNumber);
          }
        });
        
        // Set the count of unique orders
        realData.orders = uniqueOrderNumbers.size;
        
        // Calculate Average Order Value if we have orders
        if (realData.orders > 0) {
          realData.aov = realData.orderRevenue / realData.orders;
        }

        // Calculate margin percentage if we have revenue
        if (realData.orderRevenue > 0 && realData.contributionMargin !== undefined) {
          realData.marginPercentage = (realData.contributionMargin / realData.orderRevenue) * 100;
        } else {
          realData.marginPercentage = 0;
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
      .select("price, orderNumber")
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
    
    // Fetch previous period revenue data
    const { data: prevRevenueData, error: prevRevenueError } = await supabase
      .from("Sales")
      .select("price, orderNumber")
      .gte("date", prevPeriodStart.toISOString().split('T')[0])
      .lte("date", prevPeriodEnd.toISOString().split('T')[0]);
    
    if (!prevRevenueError && prevRevenueData) {
      const prevRevenue = prevRevenueData.reduce((sum, sale) => sum + (sale.price || 0), 0);
      
      // Count unique order numbers for previous period
      const uniquePrevOrderNumbers = new Set();
      prevRevenueData.forEach(sale => {
        if (sale.orderNumber) {
          uniquePrevOrderNumbers.add(sale.orderNumber);
        }
      });
      
      const prevOrders = uniquePrevOrderNumbers.size;
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
      
      // Fetch previous contribution margin data for margin percentage calculation
      const { data: prevMarginData, error: prevMarginError } = await supabase
        .from("Sales")
        .select("Profit")
        .gte("date", prevPeriodStart.toISOString().split('T')[0])
        .lte("date", prevPeriodEnd.toISOString().split('T')[0]);
      
      if (!prevMarginError && prevMarginData) {
        const prevContributionMargin = prevMarginData.reduce((sum, sale) => sum + (sale.Profit || 0), 0);
        
        // Calculate contribution margin change
        changes.contributionMarginChange = prevContributionMargin > 0 
          ? ((currentData.contributionMargin! - prevContributionMargin) / prevContributionMargin) * 100
          : 0;
        
        // Calculate previous margin percentage
        const prevMarginPercentage = prevRevenue > 0 
          ? (prevContributionMargin / prevRevenue) * 100 
          : 0;
        
        // Calculate margin percentage change
        changes.marginPercentageChange = prevMarginPercentage > 0 
          ? ((currentData.marginPercentage! - prevMarginPercentage) / prevMarginPercentage) * 100
          : 0;
      }
    }
    
    return changes;
  };

  return { fetchSalesMetrics, isLoading };
};
