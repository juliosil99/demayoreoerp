
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { processStateData, StateData } from "./utils";
import { SalesBase } from "@/integrations/supabase/types/sales";
import { DateRange } from "react-day-picker";
import { formatDateForQuery } from "@/utils/dateUtils";

export const useStateDistributionData = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ["salesStateDistribution", dateRange?.from, dateRange?.to],
    queryFn: async () => {
      let query = supabase
        .from("Sales")
        .select('state, price');
      
      // Apply date filters if provided using local timezone
      if (dateRange?.from) {
        const fromDate = formatDateForQuery(dateRange.from);
        query = query.gte('date', fromDate);
      }
      
      if (dateRange?.to) {
        const toDate = formatDateForQuery(dateRange.to);
        query = query.lte('date', toDate);
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
