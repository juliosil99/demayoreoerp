
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserCompany() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-company", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('🏢 useUserCompany - No user ID available');
        return null;
      }

      console.log('🏢 useUserCompany - Getting company for user:', user.id);

      // First check if user is in company_users table
      console.log('🔍 Checking company_users table...');
      const { data: companyUser, error: companyUserError } = await supabase
        .from("company_users")
        .select("company_id, companies(*)")
        .eq("user_id", user.id)
        .single();

      console.log('📊 company_users response:', { data: companyUser, error: companyUserError });

      if (!companyUserError && companyUser) {
        console.log('✅ useUserCompany - Found company via company_users:', companyUser.companies);
        return companyUser.companies;
      }

      console.log('🔍 useUserCompany - No company found in company_users, checking owned companies');

      // If not found, check if user owns a company
      console.log('🔍 Checking companies table...');
      const { data: ownedCompany, error: ownedCompanyError } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .single();

      console.log('📊 companies response:', { data: ownedCompany, error: ownedCompanyError });

      if (!ownedCompanyError && ownedCompany) {
        console.log('✅ useUserCompany - Found owned company:', ownedCompany);
        return ownedCompany;
      }

      console.log('❌ useUserCompany - No company found for user');
      console.log('❌ useUserCompany - Company user error:', companyUserError);
      console.log('❌ useUserCompany - Owned company error:', ownedCompanyError);
      return null;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });
}
