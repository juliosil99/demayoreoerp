
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

      console.log('🔍 COMPANY_USERS RESULT:', { 
        data: companyUser, 
        error: companyUserError?.message 
      });

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

      console.log('🔍 OWNED COMPANIES RESULT:', { 
        data: ownedCompany, 
        error: ownedCompanyError?.message 
      });

      if (!ownedCompanyError && ownedCompany) {
        console.log('✅ Found owned company:', ownedCompany.nombre);
        return ownedCompany;
      }

      console.log('❌ No company found for user');
      console.log('🔍 DEBUGGING: Let me check what companies exist...');
      
      // Debug query to see what companies exist
      const { data: allCompanies, error: allCompaniesError } = await supabase
        .from("companies")
        .select("*")
        .limit(5);
      
      console.log('🔍 ALL COMPANIES (first 5):', { 
        data: allCompanies, 
        error: allCompaniesError?.message 
      });

      // Debug query to see what company_users exist
      const { data: allCompanyUsers, error: allCompanyUsersError } = await supabase
        .from("company_users")
        .select("*")
        .limit(5);
      
      console.log('🔍 ALL COMPANY_USERS (first 5):', { 
        data: allCompanyUsers, 
        error: allCompanyUsersError?.message 
      });

      return null;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
