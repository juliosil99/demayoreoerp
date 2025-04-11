
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

export interface Recipient {
  id: string;
  name: string;
  type: string;
  rfc: string | null;
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

  const { data: recipients = [], isLoading: isLoadingRecipients } = useQuery<Recipient[], Error>({
    queryKey: ["expenseRecipients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("id, name, type, rfc")
        .in("type", ["supplier", "employee"])
        .order('name');
        
      if (error) {
        console.error("Error fetching recipients:", error);
        throw error;
      }
      
      console.log("Fetched recipients count:", data?.length);
      return data ? data.map(recipient => ({
        ...recipient,
        id: String(recipient.id)
      })) : [];
    },
    initialData: [],
  });

  const isLoading = isLoadingBankAccounts || isLoadingChartAccounts || isLoadingRecipients;

  return {
    bankAccounts,
    chartAccounts,
    recipients,
    isLoading,
  };
}
