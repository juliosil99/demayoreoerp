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
        .select("*")
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast.error("Error al cargar perfiles: " + profilesError.message);
        throw profilesError;
      }
      
      console.log("Profiles fetched successfully:", profilesData);
      
      // Filter out duplicates based on email (keep most recent)
      const uniqueProfiles = profilesData.reduce((acc: any[], profile) => {
        const existing = acc.find(p => p.email === profile.email && profile.email);
        if (!existing) {
          acc.push(profile);
        } else {
          // Keep the most recent profile
          if (profile.created_at > existing.created_at) {
            const index = acc.indexOf(existing);
            acc[index] = profile;
          }
        }
        return acc;
      }, []);
      
      // Step 2: For each unique profile, fetch company information separately
      const profilesWithCompany = await Promise.all(
        uniqueProfiles.map(async (profile) => {
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
    staleTime: 5000, // Cache for 5 seconds to reduce unnecessary requests
  });

  return { profiles, isLoading, currentUserId, error, refetch };
}
