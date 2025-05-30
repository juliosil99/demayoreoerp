
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DashboardMetrics } from "@/types/dashboard";
import { useFetchSalesData } from "./metrics/useFetchSalesData";
import { generateSampleData } from "./metrics/sampleDataGenerator";
import { supabase } from "@/lib/supabase";

export const useDashboardMetrics = (dateRange?: DateRange) => {
  const navigate = useNavigate();
  const [combinedData, setCombinedData] = useState<DashboardMetrics>({
    // Main metrics for MainMetricsSection
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
    
    // Contribution margin
    contributionMargin: 0,
    contributionMarginChange: 0,
    marginPercentage: 0,
    marginPercentageChange: 0,
    
    // Chart data
    chartData: [],
    
    // Returning customer metrics
    returningRevenue: 0,
    returningOrders: 0,
    returningAOV: 0,
    repeatRate: 0,
    returningRevenueChange: 0,
    returningOrdersChange: 0,
    returningAOVChange: 0,
    repeatRateChange: 0,
    
    // New customer metrics
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
    
    // Channel metrics
    channelMetrics: [],
    
    // Legacy metrics for backward compatibility
    yesterdaySales: 0,
    unreconciled: 0,
    receivablesPending: 0,
    salesCount: 0,
    unreconciledCount: 0,
    receivablesCount: 0
  });
  
  const [salesData, setSalesData] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { fetchSalesMetrics } = useFetchSalesData();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }

        if (dateRange?.from && dateRange?.to) {
          // Use only real data when date range is selected
          console.log("Fetching real data for date range:", dateRange);
          const realData = await fetchSalesMetrics(dateRange);
          setCombinedData(realData);
          setSalesData(realData);
          setMetricsData(null); // No sample data used
        } else {
          // Use sample data when no date range is selected (for demo purposes)
          console.log("Using sample data - no date range selected");
          const sampleData = generateSampleData(dateRange);
          setCombinedData(sampleData);
          setSalesData(null);
          setMetricsData(sampleData);
        }
        
      } catch (error) {
        console.error("Error fetching metrics:", error);
        setError(error as Error);
        toast.error("Error al cargar métricas del panel");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [navigate, dateRange, fetchSalesMetrics]);

  return { 
    combinedData, 
    salesData, 
    metricsData, 
    isLoading, 
    error 
  };
};
