
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserCompany } from "@/hooks/useUserCompany";
import { usePermissions } from "@/hooks/usePermissions";

interface UseOptimizedExpensesOptions {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export const useOptimizedExpenses = ({ 
  page = 1, 
  pageSize = 12, 
  enabled = true 
}: UseOptimizedExpensesOptions = {}) => {
  const { data: userCompany } = useUserCompany();
  const { hasPermission } = usePermissions();
  const canViewReconciliation = hasPermission('can_view_reconciliation');

  return useQuery({
    queryKey: ["optimized-unreconciled-expenses", userCompany?.id, page, pageSize],
    queryFn: async () => {
      if (!userCompany?.id || !canViewReconciliation) {
        return { data: [], count: 0, hasMore: false };
      }
      
      // Get all users from the same company (optimized)
      const { data: companyUsers, error: companyUsersError } = await supabase
        .from("company_users")
        .select("user_id")
        .eq("company_id", userCompany.id);

      if (companyUsersError) {
        throw companyUsersError;
      }

      // Get company owner
      const { data: companyOwner, error: ownerError } = await supabase
        .from("companies")
        .select("user_id")
        .eq("id", userCompany.id)
        .single();

      if (ownerError && ownerError.code !== 'PGRST116') {
        throw ownerError;
      }

      // Combine all user IDs
      const allUserIds = [
        ...companyUsers.map(cu => cu.user_id),
        ...(companyOwner ? [companyOwner.user_id] : [])
      ];

      if (allUserIds.length === 0) {
        return { data: [], count: 0, hasMore: false };
      }

      const offset = (page - 1) * pageSize;
      
      // Optimized query with pagination
      const { data, error, count } = await supabase
        .from("expenses")
        .select(`
          *,
          bank_accounts (name),
          chart_of_accounts (name, code),
          contacts (name),
          accounts_payable!expense_id (
            id,
            invoice_id,
            client:contacts!client_id (name)
          )
        `, { count: 'exact' })
        .in("user_id", allUserIds)
        .or("reconciled.is.null,reconciled.eq.false")
        .order('date', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        throw error;
      }
      
      const hasMore = count ? offset + pageSize < count : false;
      
      return { 
        data: data || [], 
        count: count || 0, 
        hasMore 
      };
    },
    enabled: !!userCompany?.id && canViewReconciliation && enabled,
    staleTime: 1000, // Reduced from 30 seconds to 1 second for faster updates
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
