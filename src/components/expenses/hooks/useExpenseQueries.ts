
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
  const { data: company, isLoading: isLoadingCompany, error: companyError } = useUserCompany();
  
  // Extract values to avoid undefined issues
  const userId = user?.id;
  const companyId = company?.id;

  console.log("🔍 useExpenseQueries DEBUG START");
  console.log("📧 userId:", userId);
  console.log("🏢 companyId:", companyId);
  console.log("⏳ isLoadingCompany:", isLoadingCompany);
  console.log("❌ companyError:", companyError);
  console.log("👤 Full user object:", user);
  console.log("🏢 Full company object:", company);

  // Only fetch bank accounts when we have a company ID
  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts, error: bankAccountsError } = useQuery<BankAccount[], Error>({
    queryKey: ["bankAccounts", companyId],
    queryFn: async () => {
      console.log("🏦 BANK ACCOUNTS QUERY START");
      console.log("🏢 Query companyId:", companyId);
      console.log("📧 Query userId (auth):", userId);
      console.log("🔐 Auth state:", { user, isAuthenticated: !!user });
      
      if (!companyId) {
        console.log("❌ No company ID available for bank accounts query");
        return [];
      }
      
      try {
        console.log("📞 Making Supabase query for bank_accounts...");
        console.log("🔍 Query details:", {
          table: "bank_accounts",
          filter: `company_id = ${companyId}`,
          select: "*"
        });
        
        const { data, error, status, statusText } = await supabase
          .from("bank_accounts")
          .select("*")
          .eq("company_id", companyId);
          
        console.log("📊 Supabase bank_accounts response:", {
          data,
          error,
          status,
          statusText,
          dataLength: data?.length || 0
        });
        
        if (error) {
          console.error("💥 Error fetching bank accounts:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        
        console.log("✅ Bank accounts fetched successfully:", data?.length || 0, "accounts");
        console.log("📋 Bank accounts details:", data);
        return data as BankAccount[];
      } catch (err) {
        console.error("💥 Exception in bank accounts query:", err);
        throw err;
      }
    },
    enabled: Boolean(companyId && !isLoadingCompany && userId), // Also check userId
    initialData: [],
    retry: 1, // Reduce retries for debugging
    retryDelay: 1000
  });

  // Chart accounts query - depends on user ID
  const { data: chartAccounts = [], isLoading: isLoadingChartAccounts, error: chartAccountsError } = useQuery<ChartAccount[], Error>({
    queryKey: ["chartAccounts", userId],
    queryFn: async () => {
      console.log("📊 CHART ACCOUNTS QUERY START");
      console.log("📧 Query userId:", userId);
      console.log("🔐 Auth state:", { user, isAuthenticated: !!user });
      
      if (!userId) {
        console.log("❌ No user ID available for chart accounts query");
        return [];
      }
      
      try {
        console.log("📞 Making Supabase query for chart_of_accounts...");
        console.log("🔍 Query details:", {
          table: "chart_of_accounts",
          filter: `user_id = ${userId}`,
          accountTypes: ["expense", "asset", "liability"],
          select: "*"
        });
        
        const { data, error, status, statusText } = await supabase
          .from("chart_of_accounts")
          .select("*")
          .eq("user_id", userId)
          .in("account_type", ["expense", "asset", "liability"])
          .order('code');
          
        console.log("📊 Supabase chart_of_accounts response:", {
          data,
          error,
          status,
          statusText,
          dataLength: data?.length || 0
        });
        
        if (error) {
          console.error("💥 Error fetching chart accounts:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        
        console.log("✅ Chart accounts fetched successfully:", data?.length || 0, "accounts");
        console.log("📋 Chart accounts details:", data);
        return data as ChartAccount[];
      } catch (err) {
        console.error("💥 Exception in chart accounts query:", err);
        throw err;
      }
    },
    enabled: Boolean(userId),
    initialData: [],
    retry: 1,
    retryDelay: 1000
  });

  // Recipients query - depends on user ID
  const { data: recipients = [], isLoading: isLoadingRecipients, error: recipientsError } = useQuery<Recipient[], Error>({
    queryKey: ["expenseRecipients", userId],
    queryFn: async () => {
      console.log("👥 RECIPIENTS QUERY START");
      console.log("📧 Query userId:", userId);
      console.log("🔐 Auth state:", { user, isAuthenticated: !!user });
      
      if (!userId) {
        console.log("❌ No user ID available for recipients query");
        return [];
      }
      
      try {
        console.log("📞 Making Supabase query for contacts...");
        console.log("🔍 Query details:", {
          table: "contacts",
          filter: `user_id = ${userId}`,
          types: ["supplier", "employee"],
          select: "id, name, type, rfc"
        });
        
        const { data, error, status, statusText } = await supabase
          .from("contacts")
          .select("id, name, type, rfc")
          .eq("user_id", userId)
          .in("type", ["supplier", "employee"])
          .order('name');
          
        console.log("📊 Recipients response:", {
          data,
          error,
          status,
          statusText,
          dataLength: data?.length || 0
        });
        
        if (error) {
          console.error("💥 Error fetching recipients:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        
        const mappedData = data ? data.map(recipient => ({
          ...recipient,
          id: String(recipient.id)
        })) : [];
        
        console.log("✅ Recipients fetched successfully:", mappedData.length, "recipients");
        console.log("📋 Recipients details:", mappedData);
        return mappedData;
      } catch (err) {
        console.error("💥 Exception in recipients query:", err);
        throw err;
      }
    },
    enabled: Boolean(userId),
    initialData: [],
    retry: 1,
    retryDelay: 1000
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

  console.log("📋 useExpenseQueries FINAL SUMMARY:");
  console.log("⏳ isLoading:", isLoading);
  console.log("🏦 bankAccounts count:", bankAccounts.length);
  console.log("📊 chartAccounts count:", chartAccounts.length);
  console.log("👥 recipients count:", recipients.length);
  console.log("❌ missingData:", missingData);
  console.log("💼 hasRequiredData:", bankAccounts.length > 0 && chartAccounts.length > 0);
  console.log("🔍 All errors:", {
    company: companyError,
    bankAccounts: bankAccountsError,
    chartAccounts: chartAccountsError,
    recipients: recipientsError
  });
  console.log("🔍 useExpenseQueries DEBUG END");

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
