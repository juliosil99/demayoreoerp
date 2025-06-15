
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BankAccount as BankAccountType } from "@/components/banking/types";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCompany } from "@/hooks/useUserCompany";
import { logError } from "@/utils/logger";

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
  const { data: company, isLoading: isLoadingCompany, error: companyError } = useUserCompany();
  
  const userId = user?.id;
  const companyId = company?.id;

  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts, error: bankAccountsError } = useQuery<BankAccount[], Error>({
    queryKey: ["bankAccounts", companyId],
    queryFn: async () => {
      if (!companyId) {
        return [];
      }

      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("company_id", companyId);

      if (error) {
        logError("Bank accounts query failed", error, "useExpenseQueries");
        throw error;
      }
      return data as BankAccount[];
    },
    enabled: !!(companyId && !isLoadingCompany),
  });

  const { data: chartAccounts = [], isLoading: isLoadingChartAccounts, error: chartAccountsError } = useQuery<ChartAccount[], Error>({
    queryKey: ["chartAccounts", userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .eq("user_id", userId)
        .in("account_type", ["expense", "asset", "liability"])
        .order('code');

      if (error) {
        logError("Chart accounts query failed", error, "useExpenseQueries");
        throw error;
      }
      return data as ChartAccount[];
    },
    enabled: !!userId,
  });

  const { data: recipients = [], isLoading: isLoadingRecipients, error: recipientsError } = useQuery<Recipient[], Error>({
    queryKey: ["expenseRecipients", userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from("contacts")
        .select("id, name, type, rfc")
        .eq("user_id", userId)
        .in("type", ["supplier", "employee"])
        .order('name');

      if (error) {
        logError("Recipients query failed", error, "useExpenseQueries");
        throw error;
      }

      const mappedData = data ? data.map(recipient => ({
        ...recipient,
        id: String(recipient.id)
      })) : [];
      return mappedData;
    },
    enabled: !!userId,
  });

  const isLoading = isLoadingCompany || isLoadingBankAccounts || isLoadingChartAccounts || isLoadingRecipients;

  const missingData = [];
  if (isLoadingCompany) missingData.push("empresa");
  if (!companyId && !isLoadingCompany) missingData.push("configuración de empresa");
  if (isLoadingBankAccounts) missingData.push("cuentas bancarias");
  if (bankAccounts.length === 0 && !isLoadingBankAccounts && companyId) missingData.push("cuentas bancarias configuradas");
  if (isLoadingChartAccounts) missingData.push("plan contable");
  if (chartAccounts.length === 0 && !isLoadingChartAccounts && userId) missingData.push("cuentas contables configuradas");
  if (isLoadingRecipients) missingData.push("contactos");

  const hookResult = {
    bankAccounts,
    chartAccounts,
    recipients,
    isLoading,
    missingData,
    hasRequiredData: bankAccounts.length > 0 && chartAccounts.length > 0,
    errors: {
      company: companyError,
      bankAccounts: bankAccountsError,
      chartAccounts: chartAccountsError,
      recipients: recipientsError
    }
  };

  return hookResult;
}
