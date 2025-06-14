
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BankAccount as BankAccountType } from "@/components/banking/types";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCompany } from "@/hooks/useUserCompany";

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
  const { user } = useAuth();
  const { data: company, isLoading: isLoadingCompany } = useUserCompany();
  const companyId = company?.id;

  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts } = useQuery<BankAccount[], Error>({
    queryKey: ["bankAccounts", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("company_id", companyId);
      if (error) {
        console.error("Error fetching bank accounts:", error);
        throw error;
      }
      return data as BankAccount[];
    },
    enabled: !!companyId,
    initialData: [],
  });

  const { data: chartAccounts = [], isLoading: isLoadingChartAccounts } = useQuery<ChartAccount[], Error>({
    queryKey: ["chartAccounts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .eq("user_id", user.id)
        .in("account_type", ["expense", "asset", "liability"])
        .order('code');
      if (error) {
        console.error("Error fetching chart accounts:", error);
        throw error;
      }
      return data as ChartAccount[];
    },
    enabled: !!user?.id,
    initialData: [],
  });

  const { data: recipients = [], isLoading: isLoadingRecipients } = useQuery<Recipient[], Error>({
    queryKey: ["expenseRecipients", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("contacts")
        .select("id, name, type, rfc")
        .eq("user_id", user.id)
        .in("type", ["supplier", "employee"])
        .order('name');
        
      if (error) {
        console.error("Error fetching recipients:", error);
        throw error;
      }
      
      return data ? data.map(recipient => ({
        ...recipient,
        id: String(recipient.id)
      })) : [];
    },
    enabled: !!user?.id,
    initialData: [],
  });

  const isLoading = isLoadingCompany || isLoadingBankAccounts || isLoadingChartAccounts || isLoadingRecipients;

  return {
    bankAccounts,
    chartAccounts,
    recipients,
    isLoading,
  };
}
