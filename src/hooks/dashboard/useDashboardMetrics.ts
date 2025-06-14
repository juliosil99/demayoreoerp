
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DashboardMetrics } from "@/types/dashboard";
import { useFetchSalesData } from "./metrics/useFetchSalesData";
import { generateSampleData } from "./metrics/sampleDataGenerator";
import { supabase } from "@/lib/supabase";
import { useDebounce } from "@/hooks/useDebounce";

export const useDashboardMetrics = (dateRange?: DateRange) => {
  const navigate = useNavigate();
  
  // Debounce del dateRange para evitar consultas excesivas
  const debouncedDateRange = useDebounce(dateRange, 500);
  
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

        if (debouncedDateRange?.from && debouncedDateRange?.to) {
          // Use only real data when date range is selected
          const realData = await fetchSalesMetrics(debouncedDateRange);
          setCombinedData(realData);
          setSalesData(realData);
          setMetricsData(null); // No sample data used
        } else {
          // Use sample data when no date range is selected (for demo purposes)
          const sampleData = generateSampleData(debouncedDateRange);
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
  }, [navigate, debouncedDateRange, fetchSalesMetrics]);

  return { 
    combinedData, 
    salesData, 
    metricsData, 
    isLoading, 
    error 
  };
};
