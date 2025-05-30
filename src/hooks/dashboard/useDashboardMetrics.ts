
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DashboardMetrics } from "@/types/dashboard";
import { useFetchSalesData } from "./metrics/useFetchSalesData";
import { generateSampleData } from "./metrics/sampleDataGenerator";

export const useDashboardMetrics = (dateRange?: DateRange) => {
  const navigate = useNavigate();
  const [combinedData, setCombinedData] = useState<DashboardMetrics>({
    // Main metrics for original dashboard
    yesterdaySales: 0,
    unreconciled: 0,
    receivablesPending: 0,
    salesCount: 0,
    unreconciledCount: 0,
    receivablesCount: 0,
    
    // Contribution margin
    contributionMargin: 0,
    contributionMarginChange: 0,
    marginPercentage: 0,
    marginPercentageChange: 0,
    
    // Chart data
    chartData: [],
    
    // Extended metrics
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
    channelMetrics: [],
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
    pamerChange: 0
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

        // Get real data from database if date range is provided
        const realData = dateRange?.from && dateRange?.to 
          ? await fetchSalesMetrics(dateRange)
          : {};

        // Generate sample data for remaining metrics - focused on original dashboard
        const sampleData = {
          ...generateSampleData(dateRange),
          // Override with original dashboard specific data
          yesterdaySales: Math.floor(Math.random() * 50000) + 10000,
          unreconciled: Math.floor(Math.random() * 25000) + 5000,
          receivablesPending: Math.floor(Math.random() * 75000) + 15000,
          salesCount: Math.floor(Math.random() * 50) + 10,
          unreconciledCount: Math.floor(Math.random() * 15) + 5,
          receivablesCount: Math.floor(Math.random() * 25) + 8,
          contributionMargin: Math.floor(Math.random() * 100000) + 50000,
          contributionMarginChange: (Math.random() - 0.5) * 20
        };
        
        // Merge real data with sample data, prioritizing real data
        const mergedData = {
          ...sampleData,
          ...realData
        };
        
        setCombinedData(mergedData);
        setSalesData(realData);
        setMetricsData(sampleData);
        
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

// Re-export the supabase client for authentication checks
import { supabase } from "@/lib/supabase";
