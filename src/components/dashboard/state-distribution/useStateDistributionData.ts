
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { processStateData, StateData } from "./utils";
import { SalesBase } from "@/integrations/supabase/types/sales";
import { DateRange } from "react-day-picker";

export const useStateDistributionData = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ["salesStateDistribution", dateRange?.from, dateRange?.to],
    queryFn: async () => {
      let query = supabase
        .from("Sales")
        .select('state, price');
      
      // Apply date filters if provided
      if (dateRange?.from) {
        query = query.gte('date', dateRange.from.toISOString().split('T')[0]);
      }
      
      if (dateRange?.to) {
        query = query.lte('date', dateRange.to.toISOString().split('T')[0]);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching sales data:", error);
        throw error;
      }
      
      // Cast the data to partial SalesBase since we're only using state and price
      return processStateData(data as SalesBase[]);
    }
  });
};
