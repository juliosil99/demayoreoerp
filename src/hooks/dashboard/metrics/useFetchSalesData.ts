import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { differenceInDays, subDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DashboardMetrics, ChartDataPoint, ChannelMetrics } from "@/types/dashboard";

export const useFetchSalesData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchSalesMetrics = useCallback(async (dateRange: DateRange): Promise<DashboardMetrics> => {
    if (!dateRange.from || !dateRange.to) {
      return getEmptyMetrics();
    }

    setIsLoading(true);
    
    try {
      // Fetch current period data
      const { data: currentSalesData, error: currentError } = await supabase
        .from("Sales")
        .select("*")
        .gte("date", dateRange.from.toISOString().split('T')[0])
        .lte("date", dateRange.to.toISOString().split('T')[0]);
      
      if (currentError) {
        console.error("Error fetching current sales data:", currentError);
        toast.error("Error al cargar datos de ventas");
        return getEmptyMetrics();
      }

      if (!currentSalesData || currentSalesData.length === 0) {
        return getEmptyMetrics();
      }

      // Calculate current period metrics
      const currentMetrics = calculateMetricsFromSalesData(currentSalesData);
      
      // Fetch previous period for comparison
      const daysDiff = differenceInDays(dateRange.to, dateRange.from) + 1;
      const prevPeriodEnd = subDays(dateRange.from, 1);
      const prevPeriodStart = subDays(prevPeriodEnd, daysDiff - 1);

      const { data: prevSalesData, error: prevError } = await supabase
        .from("Sales")
        .select("*")
        .gte("date", prevPeriodStart.toISOString().split('T')[0])
        .lte("date", prevPeriodEnd.toISOString().split('T')[0]);

      if (prevError) {
        console.error("Error fetching previous period data:", prevError);
      }

      const prevMetrics = prevSalesData ? calculateMetricsFromSalesData(prevSalesData) : getEmptyMetrics();
      
      // Calculate percentage changes
      const changes = calculateChanges(currentMetrics, prevMetrics);
      
      // Generate chart data
      const chartData = generateChartDataFromSales(currentSalesData);
      
      // Generate channel metrics
      const channelMetrics = generateChannelMetricsFromSales(currentSalesData, prevSalesData || []);

      return {
        ...currentMetrics,
        ...changes,
        chartData,
        channelMetrics
      };

    } catch (error) {
      console.error("Error in fetchSalesMetrics:", error);
      toast.error("Error al cargar métricas del dashboard");
      return getEmptyMetrics();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateMetricsFromSalesData = (salesData: any[]): DashboardMetrics => {
    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.price || 0), 0);
    const totalProfit = salesData.reduce((sum, sale) => sum + (sale.Profit || 0), 0);
    
    // Count unique orders
    const uniqueOrders = new Set();
    salesData.forEach(sale => {
      if (sale.orderNumber) {
        uniqueOrders.add(sale.orderNumber);
      }
    });
    const totalOrders = uniqueOrders.size;
    
    // Calculate AOV
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate margin percentage
    const marginPercentage = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Analyze customers (simplified - using idClient as customer identifier)
    const customerAnalysis = analyzeCustomers(salesData);
    
    return {
      orderRevenue: totalRevenue,
      contributionMargin: totalProfit,
      marginPercentage,
      orders: totalOrders,
      aov,
      
      // Customer metrics
      ...customerAnalysis,
      
      // Set defaults for metrics we can't calculate without additional data
      adSpend: 0,
      mer: 0,
      
      // Default change values
      revenueChange: 0,
      adSpendChange: 0,
      merChange: 0,
      aovChange: 0,
      ordersChange: 0,
      contributionMarginChange: 0,
      marginPercentageChange: 0,
      returningRevenueChange: 0,
      returningOrdersChange: 0,
      returningAOVChange: 0,
      repeatRateChange: 0,
      newCustomerRevenueChange: 0,
      newCustomerOrdersChange: 0,
      newCustomerAOVChange: 0,
      cacChange: 0,
      paidRevenueChange: 0,
      paidOrdersChange: 0,
      paidAOVChange: 0,
      paidCACChange: 0,
      pamerChange: 0,
      
      // Chart data and channel metrics (will be set later)
      chartData: [],
      channelMetrics: [],
      
      // Legacy metrics
      yesterdaySales: 0,
      unreconciled: 0,
      receivablesPending: 0,
      salesCount: salesData.length,
      unreconciledCount: 0,
      receivablesCount: 0
    };
  };

  const analyzeCustomers = (salesData: any[]) => {
    const customerSales = new Map();
    const customerOrders = new Map();
    
    salesData.forEach(sale => {
      const customerId = sale.idClient || 'anonymous';
      
      if (!customerSales.has(customerId)) {
        customerSales.set(customerId, 0);
        customerOrders.set(customerId, new Set());
      }
      
      customerSales.set(customerId, customerSales.get(customerId) + (sale.price || 0));
      if (sale.orderNumber) {
        customerOrders.get(customerId).add(sale.orderNumber);
      }
    });

    // For simplicity, assume customers with multiple orders are returning
    // In a real implementation, you'd need historical data to determine this
    let returningRevenue = 0;
    let returningOrders = 0;
    let newCustomerRevenue = 0;
    let newCustomerOrders = 0;

    customerSales.forEach((revenue, customerId) => {
      const orders = customerOrders.get(customerId).size;
      
      if (orders > 1) {
        // Consider as returning customer
        returningRevenue += revenue;
        returningOrders += orders;
      } else {
        // Consider as new customer
        newCustomerRevenue += revenue;
        newCustomerOrders += orders;
      }
    });

    const returningAOV = returningOrders > 0 ? returningRevenue / returningOrders : 0;
    const newCustomerAOV = newCustomerOrders > 0 ? newCustomerRevenue / newCustomerOrders : 0;
    const totalOrders = returningOrders + newCustomerOrders;
    const repeatRate = totalOrders > 0 ? (returningOrders / totalOrders) * 100 : 0;

    return {
      returningRevenue,
      returningOrders,
      returningAOV,
      repeatRate,
      newCustomerRevenue,
      newCustomerOrders,
      newCustomerAOV,
      cac: 0, // Would need marketing data
      paidRevenue: 0, // Would need marketing channel data
      paidOrders: 0,
      paidAOV: 0,
      paidCAC: 0,
      pamer: 0
    };
  };

  const calculateChanges = (current: DashboardMetrics, previous: DashboardMetrics) => {
    const calculatePercentChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      revenueChange: calculatePercentChange(current.orderRevenue || 0, previous.orderRevenue || 0),
      contributionMarginChange: calculatePercentChange(current.contributionMargin || 0, previous.contributionMargin || 0),
      marginPercentageChange: calculatePercentChange(current.marginPercentage || 0, previous.marginPercentage || 0),
      ordersChange: calculatePercentChange(current.orders || 0, previous.orders || 0),
      aovChange: calculatePercentChange(current.aov || 0, previous.aov || 0),
      adSpendChange: 0,
      merChange: 0,
      returningRevenueChange: calculatePercentChange(current.returningRevenue || 0, previous.returningRevenue || 0),
      returningOrdersChange: calculatePercentChange(current.returningOrders || 0, previous.returningOrders || 0),
      returningAOVChange: calculatePercentChange(current.returningAOV || 0, previous.returningAOV || 0),
      repeatRateChange: calculatePercentChange(current.repeatRate || 0, previous.repeatRate || 0),
      newCustomerRevenueChange: calculatePercentChange(current.newCustomerRevenue || 0, previous.newCustomerRevenue || 0),
      newCustomerOrdersChange: calculatePercentChange(current.newCustomerOrders || 0, previous.newCustomerOrders || 0),
      newCustomerAOVChange: calculatePercentChange(current.newCustomerAOV || 0, previous.newCustomerAOV || 0),
      cacChange: 0,
      paidRevenueChange: 0,
      paidOrdersChange: 0,
      paidAOVChange: 0,
      paidCACChange: 0,
      pamerChange: 0
    };
  };

  const generateChartDataFromSales = (salesData: any[]): ChartDataPoint[] => {
    // Group sales by date
    const salesByDate = salesData.reduce((acc: Record<string, number>, sale) => {
      const date = sale.date;
      if (!date) return acc;
      
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += (sale.price || 0);
      return acc;
    }, {});
    
    // Convert to chart format
    return Object.entries(salesByDate)
      .map(([date, sales]) => ({ date, sales: sales as number }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const generateChannelMetricsFromSales = (currentData: any[], previousData: any[]): ChannelMetrics[] => {
    const processChannelData = (data: any[]) => {
      const channelMap = new Map();
      
      data.forEach(sale => {
        if (!sale.Channel) return;
        
        if (!channelMap.has(sale.Channel)) {
          channelMap.set(sale.Channel, {
            revenue: 0,
            orders: new Set(),
            profit: 0
          });
        }
        
        const channel = channelMap.get(sale.Channel);
        channel.revenue += (sale.price || 0);
        channel.profit += (sale.Profit || 0);
        if (sale.orderNumber) {
          channel.orders.add(sale.orderNumber);
        }
      });
      
      return channelMap;
    };

    const currentChannels = processChannelData(currentData);
    const previousChannels = processChannelData(previousData);

    const channelMetrics: ChannelMetrics[] = [];

    currentChannels.forEach((data, channelName) => {
      const orderCount = data.orders.size;
      const aov = orderCount > 0 ? data.revenue / orderCount : 0;
      const marginPercentage = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;

      // Get previous period data for comparison
      const prevData = previousChannels.get(channelName);
      const prevOrderCount = prevData?.orders.size || 0;
      const prevRevenue = prevData?.revenue || 0;
      const prevProfit = prevData?.profit || 0;
      const prevAOV = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;
      const prevMarginPercentage = prevRevenue > 0 ? (prevProfit / prevRevenue) * 100 : 0;

      const calculateChange = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
      };

      channelMetrics.push({
        name: channelName,
        revenue: data.revenue,
        orders: orderCount,
        aov,
        contributionMargin: data.profit,
        marginPercentage,
        revenueChange: calculateChange(data.revenue, prevRevenue),
        ordersChange: calculateChange(orderCount, prevOrderCount),
        aovChange: calculateChange(aov, prevAOV),
        contributionMarginChange: calculateChange(data.profit, prevProfit),
        marginPercentageChange: calculateChange(marginPercentage, prevMarginPercentage)
      });
    });

    return channelMetrics.sort((a, b) => b.revenue - a.revenue);
  };

  const getEmptyMetrics = (): DashboardMetrics => ({
    // Main metrics
    orderRevenue: 0,
    adSpend: 0,
    mer: 0,
    aov: 0,
    orders: 0,
    
    // Change percentages
    revenueChange: 0,
    adSpendChange: 0,
    merChange: 0,
    aovChange: 0,
    ordersChange: 0,
    
    // Contribution margin
    contributionMargin: 0,
    contributionMarginChange: 0,
    marginPercentage: 0,
    marginPercentageChange: 0,
    
    // Chart data
    chartData: [],
    
    // Channel metrics
    channelMetrics: [],
    
    // Customer metrics
    returningRevenue: 0,
    returningOrders: 0,
    returningAOV: 0,
    repeatRate: 0,
    returningRevenueChange: 0,
    returningOrdersChange: 0,
    returningAOVChange: 0,
    repeatRateChange: 0,
    
    newCustomerRevenue: 0,
    newCustomerOrders: 0,
    newCustomerAOV: 0,
    cac: 0,
    newCustomerRevenueChange: 0,
    newCustomerOrdersChange: 0,
    newCustomerAOVChange: 0,
    cacChange: 0,
    
    // Paid performance metrics
    paidRevenue: 0,
    paidOrders: 0,
    paidAOV: 0,
    paidCAC: 0,
    pamer: 0,
    paidRevenueChange: 0,
    paidOrdersChange: 0,
    paidAOVChange: 0,
    paidCACChange: 0,
    pamerChange: 0,
    
    // Legacy metrics
    yesterdaySales: 0,
    unreconciled: 0,
    receivablesPending: 0,
    salesCount: 0,
    unreconciledCount: 0,
    receivablesCount: 0
  });

  return { fetchSalesMetrics, isLoading };
};
