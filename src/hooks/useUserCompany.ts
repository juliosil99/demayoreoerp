
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserCompany() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-company", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      // First check if user is in company_users table
      const { data: companyUser, error: companyUserError } = await supabase
        .from("company_users")
        .select("company_id, companies(*)")
        .eq("user_id", user.id)
        .single();

      if (!companyUserError && companyUser) {
        return companyUser.companies;
      }

      // If not in company_users, check if they own a company directly
      const { data: ownedCompany, error: ownedCompanyError } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!ownedCompanyError && ownedCompany) {
        return ownedCompany;
      }

      return null;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
