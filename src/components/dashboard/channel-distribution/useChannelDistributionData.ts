
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { processChannelData, ChannelData } from "./utils";

export const useChannelDistributionData = () => {
  return useQuery({
    queryKey: ["salesChannelDistribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Sales")
        .select('Channel, price');
      
      if (error) {
        console.error("Error fetching sales data:", error);
        throw error;
      }
      
      return processChannelData(data || []);
    }
  });
};
