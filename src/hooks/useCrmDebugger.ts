
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCrmDebugger = () => {
  return useQuery({
    queryKey: ["crm-debug"],
    queryFn: async () => {
      console.log('🔍 [CrmDebugger] Starting debug queries...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ [CrmDebugger] User error:', userError);
        throw userError;
      }
      
      if (!user) {
        console.error('❌ [CrmDebugger] No user found');
        throw new Error("No user found");
      }

      console.log('✅ [CrmDebugger] User ID:', user.id);

      // Check user's companies (as owner)
      const { data: ownedCompanies, error: ownedCompaniesError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id);

      if (ownedCompaniesError) {
        console.error('❌ [CrmDebugger] Owned companies error:', ownedCompaniesError);
      } else {
        console.log('🏢 [CrmDebugger] Owned companies:', ownedCompanies?.length || 0);
        console.log('🏢 [CrmDebugger] Sample owned companies:', ownedCompanies?.slice(0, 3));
      }

      // Check user's company memberships
      const { data: companyMemberships, error: membershipError } = await supabase
        .from('company_users')
        .select('*, companies(*)')
        .eq('user_id', user.id);

      if (membershipError) {
        console.error('❌ [CrmDebugger] Company memberships error:', membershipError);
      } else {
        console.log('👔 [CrmDebugger] Company memberships:', companyMemberships?.length || 0);
        console.log('👔 [CrmDebugger] Sample memberships:', companyMemberships?.slice(0, 3));
      }

      // Check total interactions for this user
      const { data: interactions, error: interactionsError } = await supabase
        .from('interactions')
        .select('*')
        .eq('user_id', user.id);

      if (interactionsError) {
        console.error('❌ [CrmDebugger] Interactions error:', interactionsError);
      } else {
        console.log('📊 [CrmDebugger] Total interactions:', interactions?.length || 0);
        console.log('📊 [CrmDebugger] Sample interactions:', interactions?.slice(0, 3));
      }

      // Check companies_crm for this user
      const { data: companies, error: companiesError } = await supabase
        .from('companies_crm')
        .select('*')
        .eq('user_id', user.id);

      if (companiesError) {
        console.error('❌ [CrmDebugger] Companies error:', companiesError);
      } else {
        console.log('🏢 [CrmDebugger] Total CRM companies:', companies?.length || 0);
        console.log('🏢 [CrmDebugger] Sample CRM companies:', companies?.slice(0, 3));
      }

      // Check contacts for this user
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);

      if (contactsError) {
        console.error('❌ [CrmDebugger] Contacts error:', contactsError);
      } else {
        console.log('👥 [CrmDebugger] Total contacts:', contacts?.length || 0);
        console.log('👥 [CrmDebugger] Sample contacts:', contacts?.slice(0, 3));
      }

      // Test the RPC function directly with detailed logging
      console.log('🧪 [CrmDebugger] Testing RPC function directly...');
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_crm_conversation_previews', {
        p_user_id: user.id,
        p_filter: 'all',
        p_page_size: 25,
        p_page_number: 1
      });

      if (rpcError) {
        console.error('❌ [CrmDebugger] RPC error:', rpcError);
      } else {
        console.log('🧪 [CrmDebugger] RPC result:', {
          dataType: typeof rpcData,
          isArray: Array.isArray(rpcData),
          length: rpcData?.length || 0,
          data: rpcData
        });
      }

      return {
        user_id: user.id,
        owned_companies_count: ownedCompanies?.length || 0,
        company_memberships_count: companyMemberships?.length || 0,
        interactions_count: interactions?.length || 0,
        companies_count: companies?.length || 0,
        contacts_count: contacts?.length || 0,
        rpc_result: rpcData,
        rpc_error: rpcError,
        sample_interaction: interactions?.[0] || null,
        sample_owned_company: ownedCompanies?.[0] || null,
        sample_membership: companyMemberships?.[0] || null
      };
    },
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
  });
};
