
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { processChannelData, ChannelData } from "./utils";
import { SalesBase } from "@/integrations/supabase/types/sales";
import { DateRange } from "react-day-picker";
import { formatDateForQuery } from "@/utils/dateUtils";

export const useChannelDistributionData = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ["salesChannelDistribution", dateRange?.from, dateRange?.to],
    queryFn: async () => {
      let query = supabase
        .from("Sales")
        .select('Channel, price, orderNumber');
      
      // Apply date filters if provided using local timezone
      if (dateRange?.from) {
        const fromDate = formatDateForQuery(dateRange.from);
        query = query.gte('date', fromDate);
        console.log('Channel distribution - From date filter:', fromDate);
      }
      
      if (dateRange?.to) {
        const toDate = formatDateForQuery(dateRange.to);
        query = query.lte('date', toDate);
        console.log('Channel distribution - To date filter:', toDate);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching sales data:", error);
        throw error;
      }
      
      console.log('Channel distribution - Raw data count:', data?.length || 0);
      
      // Cast the data to partial SalesBase since we're only using Channel, price, and orderNumber
      const processedData = processChannelData(data as SalesBase[]);
      console.log('Channel distribution - Processed data:', processedData);
      
      return processedData;
    }
  });
};
