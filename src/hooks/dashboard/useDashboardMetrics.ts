
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { DashboardMetrics, ChartDataPoint } from "@/types/dashboard";

export const useDashboardMetrics = (dateRange?: DateRange) => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    // Initialize with default values
    orderRevenue: 0,
    adSpend: 0,
    mer: 0,
    aov: 0,
    orders: 0,
    revenueChange: 0,
    adSpendChange: 0,
    merChange: 0,
    aovChange: 0,
    ordersChange: 0,
    chartData: [],
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        // For now, let's generate some sample data
        // This will be replaced with actual data fetching logic later
        const sampleData = generateSampleData(dateRange);
        setMetrics(sampleData);
        
      } catch (error) {
        console.error("Error fetching metrics:", error);
        toast.error("Error al cargar métricas del panel");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [navigate, dateRange]);

  return { metrics, loading };
};

// Function to generate sample data for UI testing
function generateSampleData(dateRange?: DateRange): DashboardMetrics {
  const orderRevenue = 258943.75;
  const adSpend = 38419.25;
  const orders = 3245;
  const aov = orderRevenue / orders;
  const mer = orderRevenue / adSpend;
  
  const returningRevenue = orderRevenue * 0.65;
  const returningOrders = orders * 0.6;
  const returningAOV = returningRevenue / returningOrders;
  const repeatRate = 32.5;
  
  const newCustomerRevenue = orderRevenue * 0.35;
  const newCustomerOrders = orders * 0.4;
  const newCustomerAOV = newCustomerRevenue / newCustomerOrders;
  const cac = adSpend / newCustomerOrders;
  
  const paidRevenue = orderRevenue * 0.7;
  const paidOrders = orders * 0.72;
  const paidAOV = paidRevenue / paidOrders;
  const paidCAC = adSpend / paidOrders;
  const pamer = paidRevenue / adSpend;
  
  // Create chart data
  const chartData: ChartDataPoint[] = [];
  const start = dateRange?.from ? new Date(dateRange.from) : subDays(new Date(), 30);
  const end = dateRange?.to ? new Date(dateRange.to) : new Date();
  
  let currentDate = new Date(start);
  while (currentDate <= end) {
    const dailyRevenue = orderRevenue / 30 * (0.7 + Math.random() * 0.6);
    const dailyAdSpend = adSpend / 30 * (0.8 + Math.random() * 0.4);
    
    chartData.push({
      date: format(currentDate, 'MM/dd'),
      sales: Math.round(dailyRevenue),
      adSpend: Math.round(dailyAdSpend)
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return {
    orderRevenue,
    adSpend,
    mer,
    aov,
    orders,
    revenueChange: 15.4,
    adSpendChange: 8.2,
    merChange: 6.7,
    aovChange: 3.2,
    ordersChange: 12.3,
    chartData,
    returningRevenue,
    returningOrders,
    returningAOV,
    repeatRate,
    returningRevenueChange: 18.7,
    returningOrdersChange: 14.5,
    returningAOVChange: 3.8,
    repeatRateChange: 5.2,
    newCustomerRevenue,
    newCustomerOrders,
    newCustomerAOV,
    cac,
    newCustomerRevenueChange: 9.5,
    newCustomerOrdersChange: 7.3,
    newCustomerAOVChange: 2.1,
    cacChange: -3.4,
    paidRevenue,
    paidOrders,
    paidAOV,
    paidCAC,
    pamer,
    paidRevenueChange: 16.8,
    paidOrdersChange: 14.9,
    paidAOVChange: 2.5,
    paidCACChange: -4.2,
    pamerChange: 8.3,
    // Legacy metrics
    yesterdaySales: orderRevenue / 30,
    unreconciled: 18250.43,
    receivablesPending: 42680.19,
    salesCount: orders / 30,
    unreconciledCount: 48,
    receivablesCount: 127
  };
}
