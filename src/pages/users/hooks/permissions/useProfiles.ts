
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Profile } from "../../types";
import { useAuth } from "@/contexts/AuthContext";

export function useProfiles() {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const { 
    data: profiles, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      console.log("Fetching profiles...");
      const { data, error } = await supabase
        .from("profiles")
        .select("*, companies:company_users(company:companies(id, nombre))");

      if (error) {
        console.error("Error fetching profiles:", error);
        toast.error("Error al cargar perfiles: " + error.message);
        throw error;
      }
      
      console.log("Profiles fetched successfully:", data);
      
      // Format the data for proper display
      return data.map((profile: any) => ({
        ...profile,
        company: profile.companies?.[0]?.company || null
      })) as Profile[];
    },
    retry: 1,
    retryDelay: 1000,
  });

  return { profiles, isLoading, currentUserId, error, refetch };
}
