
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { differenceInDays, subDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DashboardMetrics, ChartDataPoint, ChannelMetrics } from "@/types/dashboard";

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
        
        // 4. Fetch sales data for chart
        const chartData = await fetchChartData(dateRange);
        if (chartData) {
          realData.chartData = chartData;
        }

        // 5. Fetch channel-specific metrics
        const channelMetrics = await fetchChannelMetrics(dateRange);
        if (channelMetrics) {
          realData.channelMetrics = channelMetrics;
        }
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
  
  const fetchChartData = async (dateRange: DateRange): Promise<ChartDataPoint[] | null> => {
    try {
      // Query to get sales data grouped by date
      const { data, error } = await supabase
        .from("Sales")
        .select("date, price")
        .gte("date", dateRange.from!.toISOString().split('T')[0])
        .lte("date", dateRange.to!.toISOString().split('T')[0])
        .order("date", { ascending: true });
        
      if (error) {
        console.error("Error fetching chart data:", error);
        return null;
      }
      
      if (!data || data.length === 0) {
        return null;
      }
      
      // Group sales by date and sum the prices
      const salesByDate = data.reduce((acc: Record<string, number>, curr) => {
        const date = curr.date;
        if (!date) return acc;
        
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += (curr.price || 0);
        return acc;
      }, {});
      
      // Convert to the required chart format
      const chartData: ChartDataPoint[] = Object.entries(salesByDate).map(([date, sales]) => ({
        date,
        sales
      }));
      
      return chartData.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error("Error in fetchChartData:", error);
      return null;
    }
  };

  const fetchChannelMetrics = async (dateRange: DateRange): Promise<ChannelMetrics[] | null> => {
    try {
      // Fetch current period data by channel
      const { data: currentPeriodData, error: currentError } = await supabase
        .from("Sales")
        .select("Channel, price, orderNumber, Profit")
        .gte("date", dateRange.from!.toISOString().split('T')[0])
        .lte("date", dateRange.to!.toISOString().split('T')[0]);
        
      if (currentError) {
        console.error("Error fetching channel metrics:", currentError);
        return null;
      }

      if (!currentPeriodData || currentPeriodData.length === 0) {
        return [];
      }

      // Group by channel
      const channelMap = new Map<string, { 
        revenue: number, 
        orders: Set<string>, 
        profit: number 
      }>();

      currentPeriodData.forEach(sale => {
        if (!sale.Channel) return;

        if (!channelMap.has(sale.Channel)) {
          channelMap.set(sale.Channel, {
            revenue: 0,
            orders: new Set<string>(),
            profit: 0
          });
        }

        const channelData = channelMap.get(sale.Channel)!;
        channelData.revenue += (sale.price || 0);
        if (sale.orderNumber) {
          channelData.orders.add(sale.orderNumber);
        }
        channelData.profit += (sale.Profit || 0);
      });

      // Calculate previous period dates
      const daysDiff = differenceInDays(dateRange.to!, dateRange.from!) + 1;
      const prevPeriodEnd = subDays(dateRange.from!, 1);
      const prevPeriodStart = subDays(prevPeriodEnd, daysDiff - 1);

      // Fetch previous period data by channel
      const { data: prevPeriodData, error: prevError } = await supabase
        .from("Sales")
        .select("Channel, price, orderNumber, Profit")
        .gte("date", prevPeriodStart.toISOString().split('T')[0])
        .lte("date", prevPeriodEnd.toISOString().split('T')[0]);
        
      if (prevError) {
        console.error("Error fetching previous period channel metrics:", prevError);
      }

      // Process previous period data for comparison
      const prevChannelMap = new Map<string, { 
        revenue: number, 
        orders: Set<string>, 
        profit: number 
      }>();

      if (prevPeriodData && prevPeriodData.length > 0) {
        prevPeriodData.forEach(sale => {
          if (!sale.Channel) return;

          if (!prevChannelMap.has(sale.Channel)) {
            prevChannelMap.set(sale.Channel, {
              revenue: 0,
              orders: new Set<string>(),
              profit: 0
            });
          }

          const channelData = prevChannelMap.get(sale.Channel)!;
          channelData.revenue += (sale.price || 0);
          if (sale.orderNumber) {
            channelData.orders.add(sale.orderNumber);
          }
          channelData.profit += (sale.Profit || 0);
        });
      }

      // Convert map to array and calculate metrics
      const channelMetrics: ChannelMetrics[] = Array.from(channelMap.entries()).map(([channel, data]) => {
        const orderCount = data.orders.size;
        const aov = orderCount > 0 ? data.revenue / orderCount : 0;
        const marginPercentage = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;

        // Get previous period data for this channel
        const prevData = prevChannelMap.get(channel);
        const prevOrderCount = prevData?.orders.size || 0;
        const prevRevenue = prevData?.revenue || 0;
        const prevProfit = prevData?.profit || 0;
        const prevAOV = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;
        const prevMarginPercentage = prevRevenue > 0 ? (prevProfit / prevRevenue) * 100 : 0;

        // Calculate percentage changes
        const revenueChange = prevRevenue > 0 ? ((data.revenue - prevRevenue) / prevRevenue) * 100 : 0;
        const ordersChange = prevOrderCount > 0 ? ((orderCount - prevOrderCount) / prevOrderCount) * 100 : 0;
        const aovChange = prevAOV > 0 ? ((aov - prevAOV) / prevAOV) * 100 : 0;
        const contributionMarginChange = prevProfit > 0 ? ((data.profit - prevProfit) / prevProfit) * 100 : 0;
        const marginPercentageChange = prevMarginPercentage > 0 ? ((marginPercentage - prevMarginPercentage) / prevMarginPercentage) * 100 : 0;

        return {
          name: channel,
          revenue: data.revenue,
          orders: orderCount,
          aov,
          contributionMargin: data.profit,
          marginPercentage,
          revenueChange,
          ordersChange,
          aovChange,
          contributionMarginChange,
          marginPercentageChange
        };
      });

      // Sort channels by revenue in descending order
      return channelMetrics.sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      console.error("Error in fetchChannelMetrics:", error);
      return null;
    }
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
