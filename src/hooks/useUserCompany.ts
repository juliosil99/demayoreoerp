
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

      console.log('useUserCompany - Getting company for user:', user.id);

      // First check if user is in company_users table
      const { data: companyUser, error: companyUserError } = await supabase
        .from("company_users")
        .select("company_id, companies(*)")
        .eq("user_id", user.id)
        .single();

      if (!companyUserError && companyUser) {
        console.log('useUserCompany - Found company via company_users:', companyUser.companies);
        return companyUser.companies;
      }

      // If not found, check if user owns a company
      const { data: ownedCompany, error: ownedCompanyError } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!ownedCompanyError && ownedCompany) {
        console.log('useUserCompany - Found owned company:', ownedCompany);
        return ownedCompany;
      }

      console.log('useUserCompany - No company found for user');
      return null;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });
}
