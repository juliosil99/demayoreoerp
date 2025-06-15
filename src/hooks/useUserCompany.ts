
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserCompany() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-company", user?.id],
    queryFn: async () => {
      console.log('🏢 useUserCompany - DETAILED DEBUG START');
      console.log('📧 User ID from auth:', user?.id);
      console.log('👤 Full user object:', user);
      console.log('🔐 User authenticated:', !!user);
      
      if (!user?.id) {
        console.log('❌ useUserCompany - No user ID available');
        console.log('🔐 Auth state details:', { 
          hasUser: !!user,
          userId: user?.id,
          userEmail: user?.email
        });
        return null;
      }

      console.log('🏢 useUserCompany - Getting company for user:', user.id);

      // First check if user is in company_users table
      console.log('🔍 Checking company_users table...');
      console.log('🔍 Query details:', {
        table: 'company_users',
        filter: `user_id = ${user.id}`,
        select: 'company_id, companies(*)'
      });
      
      const { data: companyUser, error: companyUserError, status: companyUserStatus } = await supabase
        .from("company_users")
        .select("company_id, companies(*)")
        .eq("user_id", user.id)
        .single();

      console.log('📊 company_users response:', { 
        data: companyUser, 
        error: companyUserError,
        status: companyUserStatus,
        hasData: !!companyUser,
        companyId: companyUser?.company_id
      });

      if (!companyUserError && companyUser) {
        console.log('✅ useUserCompany - Found company via company_users:', companyUser.companies);
        console.log('🏢 Company details:', {
          id: companyUser.companies?.id,
          name: companyUser.companies?.nombre,
          rfc: companyUser.companies?.rfc
        });
        return companyUser.companies;
      }

      console.log('🔍 useUserCompany - No company found in company_users, checking owned companies');
      console.log('❌ company_users error details:', {
        message: companyUserError?.message,
        details: companyUserError?.details,
        hint: companyUserError?.hint,
        code: companyUserError?.code
      });

      // If not found, check if user owns a company
      console.log('🔍 Checking companies table...');
      console.log('🔍 Query details:', {
        table: 'companies',
        filter: `user_id = ${user.id}`,
        select: '*'
      });
      
      const { data: ownedCompany, error: ownedCompanyError, status: ownedCompanyStatus } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .single();

      console.log('📊 companies response:', { 
        data: ownedCompany, 
        error: ownedCompanyError,
        status: ownedCompanyStatus,
        hasData: !!ownedCompany
      });

      if (!ownedCompanyError && ownedCompany) {
        console.log('✅ useUserCompany - Found owned company:', ownedCompany);
        console.log('🏢 Owned company details:', {
          id: ownedCompany.id,
          name: ownedCompany.nombre,
          rfc: ownedCompany.rfc
        });
        return ownedCompany;
      }

      console.log('❌ useUserCompany - No company found for user');
      console.log('❌ company_users error details:', {
        message: companyUserError?.message,
        details: companyUserError?.details,
        hint: companyUserError?.hint,
        code: companyUserError?.code
      });
      console.log('❌ owned company error details:', {
        message: ownedCompanyError?.message,
        details: ownedCompanyError?.details,
        hint: ownedCompanyError?.hint,
        code: ownedCompanyError?.code
      });
      console.log('🏢 useUserCompany - DETAILED DEBUG END');
      
      return null;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Reduce retries for debugging
    retryDelay: 1000
  });
}
