
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
  
  // Extract values to avoid undefined issues
  const userId = user?.id;
  const companyId = company?.id;

  console.log("🔍 EXPENSE QUERIES - Simple Debug");
  console.log("📧 userId:", userId);
  console.log("🏢 companyId:", companyId);
  console.log("⏳ isLoadingCompany:", isLoadingCompany);

  // Test query: Count bank accounts for this company
  const { data: bankAccountCount } = useQuery({
    queryKey: ["bankAccountCount", companyId],
    queryFn: async () => {
      if (!companyId) return 0;
      
      console.log("🔍 TESTING: Counting bank accounts for company:", companyId);
      const { count, error } = await supabase
        .from("bank_accounts")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId);
        
      console.log("🔍 BANK ACCOUNT COUNT RESULT:", { count, error });
      return count || 0;
    },
    enabled: Boolean(companyId),
  });

  // Test query: Count chart accounts for this user
  const { data: chartAccountCount } = useQuery({
    queryKey: ["chartAccountCount", userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      console.log("🔍 TESTING: Counting chart accounts for user:", userId);
      const { count, error } = await supabase
        .from("chart_of_accounts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("account_type", ["expense", "asset", "liability"]);
        
      console.log("🔍 CHART ACCOUNT COUNT RESULT:", { count, error });
      return count || 0;
    },
    enabled: Boolean(userId),
  });

  // Actual bank accounts query (simplified)
  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts, error: bankAccountsError } = useQuery<BankAccount[], Error>({
    queryKey: ["bankAccounts", companyId],
    queryFn: async () => {
      if (!companyId) {
        console.log("❌ No companyId for bank accounts");
        return [];
      }
      
      console.log("🏦 Fetching bank accounts for company:", companyId);
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("company_id", companyId);
        
      if (error) {
        console.error("❌ Bank accounts error:", error);
        logError("Bank accounts query failed", error, "useExpenseQueries");
        throw error;
      }
      
      console.log("✅ Bank accounts fetched:", data?.length || 0);
      return data as BankAccount[];
    },
    enabled: Boolean(companyId && !isLoadingCompany && userId),
    initialData: [],
  });

  // Chart accounts query (simplified)
  const { data: chartAccounts = [], isLoading: isLoadingChartAccounts, error: chartAccountsError } = useQuery<ChartAccount[], Error>({
    queryKey: ["chartAccounts", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("❌ No userId for chart accounts");
        return [];
      }
      
      console.log("📊 Fetching chart accounts for user:", userId);
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .eq("user_id", userId)
        .in("account_type", ["expense", "asset", "liability"])
        .order('code');
        
      if (error) {
        console.error("❌ Chart accounts error:", error);
        logError("Chart accounts query failed", error, "useExpenseQueries");
        throw error;
      }
      
      console.log("✅ Chart accounts fetched:", data?.length || 0);
      return data as ChartAccount[];
    },
    enabled: Boolean(userId),
    initialData: [],
  });

  // Recipients query (simplified)
  const { data: recipients = [], isLoading: isLoadingRecipients, error: recipientsError } = useQuery<Recipient[], Error>({
    queryKey: ["expenseRecipients", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("❌ No userId for recipients");
        return [];
      }
      
      console.log("👥 Fetching recipients for user:", userId);
      const { data, error } = await supabase
        .from("contacts")
        .select("id, name, type, rfc")
        .eq("user_id", userId)
        .in("type", ["supplier", "employee"])
        .order('name');
        
      if (error) {
        console.error("❌ Recipients error:", error);
        logError("Recipients query failed", error, "useExpenseQueries");
        throw error;
      }
      
      const mappedData = data ? data.map(recipient => ({
        ...recipient,
        id: String(recipient.id)
      })) : [];
      
      console.log("✅ Recipients fetched:", mappedData.length);
      return mappedData;
    },
    enabled: Boolean(userId),
    initialData: [],
  });

  // Calculate comprehensive loading state
  const isLoading = isLoadingCompany || isLoadingBankAccounts || isLoadingChartAccounts || isLoadingRecipients;

  // Determine what data we're missing
  const missingData = [];
  if (isLoadingCompany) missingData.push("empresa");
  if (!companyId && !isLoadingCompany) missingData.push("configuración de empresa");
  if (isLoadingBankAccounts) missingData.push("cuentas bancarias");
  if (bankAccounts.length === 0 && !isLoadingBankAccounts && companyId) missingData.push("cuentas bancarias configuradas");
  if (isLoadingChartAccounts) missingData.push("plan contable");
  if (chartAccounts.length === 0 && !isLoadingChartAccounts && userId) missingData.push("cuentas contables configuradas");
  if (isLoadingRecipients) missingData.push("contactos");

  console.log("📋 SUMMARY:");
  console.log("🏦 Bank accounts:", bankAccounts.length, "| Count test:", bankAccountCount);
  console.log("📊 Chart accounts:", chartAccounts.length, "| Count test:", chartAccountCount);
  console.log("👥 Recipients:", recipients.length);
  console.log("❌ Missing:", missingData);

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
