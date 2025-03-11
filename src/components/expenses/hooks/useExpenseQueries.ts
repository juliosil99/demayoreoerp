
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useExpenseQueries() {
  const { currentCompany } = useAuth();
  
  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts } = useQuery({
    queryKey: ["bankAccounts", currentCompany?.id],
    queryFn: async () => {
      // Modified query to get bank accounts associated with the current company
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("company_id", currentCompany?.id);
        
      if (error) throw error;
      return data;
    },
    initialData: [],
    enabled: !!currentCompany?.id,
  });

  const { data: chartAccounts = [], isLoading: isLoadingChartAccounts } = useQuery({
    queryKey: ["chartAccounts", currentCompany?.id],
    queryFn: async () => {
      // Query to get chart accounts associated with the company
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .in("account_type", ["expense", "asset", "liability"])
        .eq("company_id", currentCompany?.id)
        .order('code');
        
      if (error) throw error;
      return data;
    },
    initialData: [],
    enabled: !!currentCompany?.id,
  });

  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ["suppliers", currentCompany?.id],
    queryFn: async () => {
      // Query to get suppliers associated with the company
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("type", "supplier")
        .eq("company_id", currentCompany?.id);
        
      if (error) throw error;
      return data;
    },
    initialData: [],
    enabled: !!currentCompany?.id,
  });

  const isLoading = isLoadingBankAccounts || isLoadingChartAccounts || isLoadingSuppliers;

  return {
    bankAccounts,
    chartAccounts,
    suppliers,
    isLoading,
  };
}
