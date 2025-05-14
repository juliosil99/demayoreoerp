
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
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
        .select("*");

      if (error) {
        console.error("Error fetching profiles:", error);
        toast({
          title: "Error",
          description: "Error al cargar perfiles: " + error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("Profiles fetched successfully:", data);
      return data as Profile[];
    },
    retry: 1,
    retryDelay: 1000,
  });

  return { profiles, isLoading, currentUserId, error, refetch };
}
