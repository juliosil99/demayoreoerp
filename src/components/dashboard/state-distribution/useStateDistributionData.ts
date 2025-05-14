
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { processStateData, StateData } from "./utils";
import { SalesBase } from "@/integrations/supabase/types/sales";

export const useStateDistributionData = () => {
  return useQuery({
    queryKey: ["salesStateDistribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Sales")
        .select('state, price');
      
      if (error) {
        console.error("Error fetching sales data:", error);
        throw error;
      }
      
      // Cast the data to partial SalesBase since we're only using state and price
      return processStateData(data as SalesBase[]);
    }
  });
};
