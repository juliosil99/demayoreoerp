
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "../types";

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      console.log("Fetching profiles from the profiles table...");
      
      try {
        // Fetch profiles directly from the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) {
          console.error("Error fetching profiles:", error);
          toast.error("Error al cargar usuarios: " + error.message);
          throw error;
        }
        
        console.log("Fetched profiles:", data);
        
        if (!data || data.length === 0) {
          console.log("No profiles found in the database.");
        }
        
        return data as Profile[];
      } catch (error) {
        console.error("Error in useProfiles:", error);
        toast.error("Error al cargar usuarios: " + (error as Error).message);
        return [];
      }
    },
  });
}
