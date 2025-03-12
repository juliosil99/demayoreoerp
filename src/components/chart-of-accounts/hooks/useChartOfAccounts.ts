
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
}

export function useChartOfAccounts(userId: string | undefined) {
  return useQuery<Account[], Error>({
    queryKey: ['chart-of-accounts'],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('user_id', userId)
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
