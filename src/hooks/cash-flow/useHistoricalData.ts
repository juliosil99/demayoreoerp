
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ForecastHistoricalData } from "@/types/cashFlow";
import { BankAccount } from "@/components/banking/types";

export function useHistoricalData() {
  // Fetch payables data
  const { data: payables = [] } = useQuery({
    queryKey: ["accounts-payable"],
    queryFn: async () => {
      const { data, error } = await supabase.from("accounts_payable").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch receivables data
  const { data: receivables = [] } = useQuery({
    queryKey: ["accounts-receivable"],
    queryFn: async () => {
      const { data, error } = await supabase.from("accounts_receivable").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch expenses data
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("expenses").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch sales data
  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase.from("Sales").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch bank accounts data
  const { data: bankAccounts = [], isLoading: isLoadingBankAccounts } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bank_accounts").select("*");
      if (error) throw error;
      return data as BankAccount[];
    },
  });
  
  // Calculate total bank balance
  const totalBankBalance = bankAccounts.reduce((sum, account) => sum + (account.balance || 0), 0);

  // Combined historical data
  const historicalData: ForecastHistoricalData = {
    payables,
    receivables,
    expenses,
    sales,
    bankAccounts,
    totalBankBalance
  };

  return {
    historicalData,
    isLoading: isLoadingBankAccounts, // Use bankAccounts loading state as indicator
    payables,
    receivables,
    expenses,
    sales,
    bankAccounts,
    totalBankBalance
  };
}
