
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Account } from "../types/account";

export function useChartOfAccounts(userId: string | undefined) {
  const { currentCompany } = useAuth();
  
  return useQuery({
    queryKey: ['chart-of-accounts', currentCompany?.id],
    queryFn: async (): Promise<Account[]> => {
      if (!currentCompany?.id) {
        throw new Error("No company selected");
      }
      
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('path');
      
      if (error) {
        toast.error('Error loading accounts');
        throw error;
      }
      return data as Account[];
    },
    enabled: !!currentCompany?.id,
  });
}
