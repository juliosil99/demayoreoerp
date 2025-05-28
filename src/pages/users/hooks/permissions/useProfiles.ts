
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
      
      // Step 2: Get all company_users relationships to include users without profiles
      const { data: companyUsersData, error: companyUsersError } = await supabase
        .from("company_users")
        .select(`
          user_id,
          role,
          company:companies(id, nombre)
        `);

      if (companyUsersError) {
        console.error("Error fetching company users:", companyUsersError);
      }

      // Step 3: Merge profiles with company users data
      const allUserIds = new Set([
        ...uniqueProfiles.map(p => p.id),
        ...(companyUsersData || []).map(cu => cu.user_id)
      ]);

      const profilesWithCompany = await Promise.all(
        Array.from(allUserIds).map(async (userId) => {
          // Find existing profile or create placeholder
          let profile = uniqueProfiles.find(p => p.id === userId);
          if (!profile) {
            // For users in company_users but not in profiles, try to get from auth.users
            console.log(`Profile not found for user ${userId}, fetching from auth`);
            
            // Get user email from auth if possible (this requires admin access)
            const companyUser = companyUsersData?.find(cu => cu.user_id === userId);
            
            profile = {
              id: userId,
              email: null, // Will be updated when user logs in
              first_name: null,
              last_name: null,
              created_at: new Date().toISOString()
            };
          }
          
          // Get company information from company_users
          const companyUser = companyUsersData?.find(cu => cu.user_id === userId);
          
          return {
            ...profile,
            company: companyUser?.company || null
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
