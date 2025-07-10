
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Account {
  id: string;
  code: string;
  name: string;
  account_type: string;
  sat_code: string | null;
  account_use: string | null;
  parent_id: string | null;
  is_group: boolean;
  level: number;
  path: string;
  is_global: boolean;
  user_id: string | null;
}

export function useChartOfAccounts(userId: string | undefined) {
  return useQuery<Account[], Error>({
    queryKey: ['chart-of-accounts', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Get both global accounts and user-specific accounts
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .or(`is_global.eq.true,user_id.eq.${userId}`)
        .order('path');
      
      if (error) {
        toast.error('Error loading accounts');
        throw error;
      }
      return data as Account[];
    },
    enabled: !!userId,
  });
}
