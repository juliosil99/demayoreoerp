
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
      
      // Step 1: Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast.error("Error al cargar perfiles: " + profilesError.message);
        throw profilesError;
      }
      
      console.log("Profiles fetched successfully:", profilesData);
      
      // Step 2: For each profile, fetch company information separately
      const profilesWithCompany = await Promise.all(
        profilesData.map(async (profile) => {
          // Get company information from company_users and companies tables
          const { data: companyData } = await supabase
            .from("company_users")
            .select("company:companies(id, nombre)")
            .eq("user_id", profile.id)
            .maybeSingle();
          
          // Return profile with company information
          return {
            ...profile,
            company: companyData?.company || null
          };
        })
      );
      
      console.log("Profiles with company info:", profilesWithCompany);
      return profilesWithCompany as Profile[];
    },
    retry: 1,
    retryDelay: 1000,
  });

  return { profiles, isLoading, currentUserId, error, refetch };
}
