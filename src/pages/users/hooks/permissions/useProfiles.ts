
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Profile } from "../../types";
import { useAuth } from "@/contexts/AuthContext";

export function useProfiles() {
  const { user: currentUser } = useAuth();
  
  const { data: profiles, isLoading: isProfilesLoading } = useQuery({
    queryKey: ["profiles-with-companies"],
    queryFn: async () => {
      // Get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        toast.error("Error al cargar usuarios: " + profilesError.message);
        throw profilesError;
      }

      // Get company-user relationships
      const { data: companyUsers, error: companyUsersError } = await supabase
        .from('company_users')
        .select('*, companies:company_id(id, nombre)');
      
      if (companyUsersError) {
        toast.error("Error al cargar relaciones de empresa: " + companyUsersError.message);
        throw companyUsersError;
      }

      // Map company info to profiles
      const enrichedProfiles = profilesData.map((profile: Profile) => {
        const userCompany = companyUsers.find((cu: any) => cu.user_id === profile.id);
        return {
          ...profile,
          company: userCompany ? {
            id: userCompany.companies.id,
            nombre: userCompany.companies.nombre,
          } : null,
          isCurrentUser: profile.id === currentUser?.id
        };
      });

      return enrichedProfiles as Profile[];
    },
  });

  return { profiles, isLoading: isProfilesLoading, currentUserId: currentUser?.id };
}
