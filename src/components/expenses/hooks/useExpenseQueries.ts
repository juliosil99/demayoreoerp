
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BankAccount {
  id: string;
  name: string;
  [key: string]: any;
}

interface ChartAccount {
  id: string;
  name: string;
  code: string;
  [key: string]: any;
}

interface Supplier {
  id: string;
  name: string;
  [key: string]: any;
}

export function useExpenseQueries() {
  const { currentCompany } = useAuth();
  
  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts } = useQuery<BankAccount[]>({
    queryKey: ["bankAccounts", currentCompany?.id],
    queryFn: async () => {
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

  const { data: chartAccounts = [], isLoading: isLoadingChartAccounts } = useQuery<ChartAccount[]>({
    queryKey: ["chartAccounts", currentCompany?.id],
    queryFn: async () => {
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

  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery<Supplier[]>({
    queryKey: ["suppliers", currentCompany?.id],
    queryFn: async () => {
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
