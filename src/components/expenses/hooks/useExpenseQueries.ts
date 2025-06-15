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

  // LOG: Mostramos los datos actuales de usuario y empresa
  console.log("[useExpenseQueries] userId:", userId);
  console.log("[useExpenseQueries] companyId:", companyId);
  console.log("[useExpenseQueries] company data:", company);
  console.log("[useExpenseQueries] Auth user object:", user);

  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts, error: bankAccountsError } = useQuery<BankAccount[], Error>({
    queryKey: ["bankAccounts", companyId],
    queryFn: async () => {
      if (!companyId) {
        console.log("[useExpenseQueries] No companyId, no se consultan cuentas bancarias");
        return [];
      }

      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("company_id", companyId);

      console.log("[useExpenseQueries] bank_accounts - data:", data);
      if (error) {
        console.error("[useExpenseQueries] ❌ Error en bank_accounts:", error);
        logError("Bank accounts query failed", error, "useExpenseQueries");
        throw error;
      }
      return data as BankAccount[];
    },
    enabled: !!(companyId && !isLoadingCompany),
    initialData: [],
  });

  const { data: chartAccounts = [], isLoading: isLoadingChartAccounts, error: chartAccountsError } = useQuery<ChartAccount[], Error>({
    queryKey: ["chartAccounts", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("[useExpenseQueries] No userId, no se consultan cuentas contables");
        return [];
      }

      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .eq("user_id", userId)
        .in("account_type", ["expense", "asset", "liability"])
        .order('code');

      console.log("[useExpenseQueries] chart_of_accounts - data:", data);
      if (error) {
        console.error("[useExpenseQueries] ❌ Error en chart_of_accounts:", error);
        logError("Chart accounts query failed", error, "useExpenseQueries");
        throw error;
      }
      return data as ChartAccount[];
    },
    enabled: !!userId,
    initialData: [],
  });

  const { data: recipients = [], isLoading: isLoadingRecipients, error: recipientsError } = useQuery<Recipient[], Error>({
    queryKey: ["expenseRecipients", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("[useExpenseQueries] No userId, no se consultan destinatarios");
        return [];
      }

      const { data, error } = await supabase
        .from("contacts")
        .select("id, name, type, rfc")
        .eq("user_id", userId)
        .in("type", ["supplier", "employee"])
        .order('name');

      console.log("[useExpenseQueries] contacts (recipients) - data:", data);
      if (error) {
        console.error("[useExpenseQueries] ❌ Error en recipients:", error);
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
    initialData: [],
  });

  // LOG: Salida de datos
  console.log("[useExpenseQueries] Final - bankAccounts:", bankAccounts, "error:", bankAccountsError);
  console.log("[useExpenseQueries] Final - chartAccounts:", chartAccounts, "error:", chartAccountsError);
  console.log("[useExpenseQueries] Final - recipients:", recipients, "error:", recipientsError);

  const isLoading = isLoadingCompany || isLoadingBankAccounts || isLoadingChartAccounts || isLoadingRecipients;

  const missingData = [];
  if (isLoadingCompany) missingData.push("empresa");
  if (!companyId && !isLoadingCompany) missingData.push("configuración de empresa");
  if (isLoadingBankAccounts) missingData.push("cuentas bancarias");
  if (bankAccounts.length === 0 && !isLoadingBankAccounts && companyId) missingData.push("cuentas bancarias configuradas");
  if (isLoadingChartAccounts) missingData.push("plan contable");
  if (chartAccounts.length === 0 && !isLoadingChartAccounts && userId) missingData.push("cuentas contables configuradas");
  if (isLoadingRecipients) missingData.push("contactos");

  return {
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
}
