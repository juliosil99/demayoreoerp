
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserCompany() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-company", user?.id],
    queryFn: async () => {
      console.log('🏢 Getting company for user:', user?.id);
      
      if (!user?.id) {
        console.log('❌ No user ID available');
        return null;
      }

      // First check if user is in company_users table
      console.log('🔍 Checking company_users...');
      const { data: companyUser, error: companyUserError } = await supabase
        .from("company_users")
        .select("company_id, companies(*)")
        .eq("user_id", user.id)
        .single();

      if (!companyUserError && companyUser) {
        console.log('✅ Found company via company_users:', companyUser.companies?.nombre);
        return companyUser.companies;
      }

      console.log('🔍 Checking owned companies...');
      const { data: ownedCompany, error: ownedCompanyError } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!ownedCompanyError && ownedCompany) {
        console.log('✅ Found owned company:', ownedCompany.nombre);
        return ownedCompany;
      }

      console.log('❌ No company found for user');
      return null;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
