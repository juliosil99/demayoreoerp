
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BankAccount, ChartAccount, Supplier } from "../types/expense";

export function useExpenseQueries() {
  const { currentCompany } = useAuth();
  
  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts } = useQuery({
    queryKey: ["bankAccounts", currentCompany?.id],
    queryFn: async (): Promise<BankAccount[]> => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("company_id", currentCompany?.id);
        
      if (error) throw error;
      return data as BankAccount[];
    },
    enabled: !!currentCompany?.id,
  });

  const { data: chartAccounts = [], isLoading: isLoadingChartAccounts } = useQuery({
    queryKey: ["chartAccounts", currentCompany?.id],
    queryFn: async (): Promise<ChartAccount[]> => {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .in("account_type", ["expense", "asset", "liability"])
        .eq("company_id", currentCompany?.id)
        .order('code');
        
      if (error) throw error;
      return data as ChartAccount[];
    },
    enabled: !!currentCompany?.id,
  });

  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ["suppliers", currentCompany?.id],
    queryFn: async (): Promise<Supplier[]> => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("type", "supplier")
        .eq("company_id", currentCompany?.id);
        
      if (error) throw error;
      return data as Supplier[];
    },
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
