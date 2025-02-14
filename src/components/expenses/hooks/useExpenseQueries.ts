
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useExpenseQueries() {
  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts } = useQuery({
    queryKey: ["bankAccounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*");
      if (error) throw error;
      return data;
    },
    initialData: [],
  });

  const { data: chartAccounts = [], isLoading: isLoadingChartAccounts } = useQuery({
    queryKey: ["chartAccounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .in("account_type", ["expense", "asset", "liability"])
        .order('code');
      if (error) throw error;
      return data;
    },
    initialData: [],
  });

  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("type", "supplier");
      if (error) throw error;
      return data;
    },
    initialData: [],
  });

  const isLoading = isLoadingBankAccounts || isLoadingChartAccounts || isLoadingSuppliers;

  return {
    bankAccounts,
    chartAccounts,
    suppliers,
    isLoading,
  };
}
