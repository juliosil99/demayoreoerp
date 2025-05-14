import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DashboardMetrics } from "@/types/dashboard";
import { useFetchSalesData } from "./metrics/useFetchSalesData";
import { generateSampleData } from "./metrics/sampleDataGenerator";

export const useDashboardMetrics = (dateRange?: DateRange) => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    // Initialize with default values
    contributionMargin: 0,
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

        // Generate sample data for remaining metrics
        const sampleData = generateSampleData(dateRange);
        
        // Merge real data with sample data, prioritizing real data
        setMetrics({
          ...sampleData,
          ...realData
        });
        
      } catch (error) {
        console.error("Error fetching metrics:", error);
        toast.error("Error al cargar métricas del panel");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [navigate, dateRange, fetchSalesMetrics]);

  return { metrics, loading };
};

// Re-export the supabase client for authentication checks
import { supabase } from "@/lib/supabase";
