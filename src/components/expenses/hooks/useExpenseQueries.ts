
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BankAccount as BankAccountType } from "@/components/banking/types";

export interface BankAccount extends BankAccountType {}

export interface ChartAccount {
  id: string;
  code: string;
  name: string;
  account_type: string;
}

export interface Supplier {
  id: string;
  name: string;
  type: string;
}

export function useExpenseQueries() {
  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts } = useQuery<BankAccount[], Error>({
    queryKey: ["bankAccounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*");
      if (error) throw error;
      return data as BankAccount[];
    },
    initialData: [],
  });

  const { data: chartAccounts = [], isLoading: isLoadingChartAccounts } = useQuery<ChartAccount[], Error>({
    queryKey: ["chartAccounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .in("account_type", ["expense", "asset", "liability"])
        .order('code');
      if (error) throw error;
      return data as ChartAccount[];
    },
    initialData: [],
  });

  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery<Supplier[], Error>({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("type", "supplier");
      if (error) throw error;
      return data as Supplier[];
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
