
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StateData } from "./utils";
import { DateRange } from "react-day-picker";
import { formatDateForQuery } from "@/utils/dateUtils";
import { useAuth } from "@/contexts/AuthContext";

export const useStateDistributionData = (dateRange?: DateRange) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["salesStateDistribution", user?.id, dateRange?.from, dateRange?.to],
    queryFn: async () => {
      let fromDate = null;
      let toDate = null;
      
      // Apply date filters if provided using local timezone
      if (dateRange?.from) {
        fromDate = formatDateForQuery(dateRange.from);
      }
      
      if (dateRange?.to) {
        toDate = formatDateForQuery(dateRange.to);
      }
      
      // Call the SQL function with user_id and date parameters
      const { data, error } = await supabase.rpc('get_state_distribution', {
        p_user_id: user?.id,
        p_start_date: fromDate,
        p_end_date: toDate
      });
      
      if (error) {
        console.error("Error fetching state distribution data:", error);
        throw error;
      }
      
      // Process the SQL results into the expected format
      const processedData = processStateSQLResults(data || []);
      
      return processedData;
    },
    staleTime: 3 * 60 * 1000, // 3 minutos de cache para distribución de estados
    gcTime: 10 * 60 * 1000, // 10 minutos en garbage collection
    refetchOnMount: false, // No refetch al montar si hay datos en cache
    retry: 2,
    enabled: !!user // Only run query when user is authenticated
  });
};

// Process SQL function results into the expected StateData format
const processStateSQLResults = (sqlResults: any[]): StateData[] => {
  if (!sqlResults || sqlResults.length === 0) {
    return [];
  }

  // Convert SQL results to StateData format
  const stateData = sqlResults.map(result => ({
    state: result.state || "Sin Estado",
    count: Number(result.total_records || 0), // Use total_records as count
    value: Number(result.total_revenue || 0)
  }));

  // Take top 6 states and group the rest as "Otros"
  const topStates = stateData.slice(0, 6);
  const otherStates = stateData.slice(6);
  
  if (otherStates.length > 0) {
    const otherTotal = otherStates.reduce(
      (sum, state) => ({
        count: sum.count + state.count,
        value: sum.value + state.value
      }),
      { count: 0, value: 0 }
    );
    
    topStates.push({
      state: "Otros Estados",
      count: otherTotal.count,
      value: otherTotal.value
    });
  }

  // Calculate percentages based on total value
  const totalValue = stateData.reduce((sum, state) => sum + state.value, 0);
  const result = topStates.map(state => ({
    ...state,
    percentage: totalValue > 0 ? ((state.value / totalValue) * 100).toFixed(1) : "0.0"
  }));

  return result;
};
