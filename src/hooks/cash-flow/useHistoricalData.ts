
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
      console.log("[DEBUG - Balance Tracking] Raw bank accounts data:", data);
      return data as BankAccount[];
    },
  });
  
  // Calculate different types of balances
  const availableCashBalance = bankAccounts
    .filter(account => account.type === "Bank" || account.type === "Cash")
    .reduce((sum, account) => sum + (account.balance || 0), 0);
  
  const creditLiabilities = bankAccounts
    .filter(account => account.type === "Credit Card" || account.type === "Credit Simple")
    .reduce((sum, account) => sum + (account.balance || 0), 0);
  
  // Calculate net position (Available Cash - Credit Liabilities)
  const netPosition = availableCashBalance + creditLiabilities; // Credit liabilities are typically negative

  // Detailed logging for balance calculation
  console.log("[DEBUG - Balance Tracking] Bank accounts count:", bankAccounts.length);
  console.log("[DEBUG - Balance Tracking] Bank accounts by type:", bankAccounts.map(account => ({
    id: account.id,
    name: account.name,
    type: account.type,
    balance: account.balance
  })));
  console.log("[DEBUG - Balance Tracking] Available Cash Balance:", availableCashBalance);
  console.log("[DEBUG - Balance Tracking] Credit Liabilities:", creditLiabilities);
  console.log("[DEBUG - Balance Tracking] Net Position (Initial Balance):", netPosition);

  // Get upcoming credit payments (simplified approach - will need to be enhanced)
  const upcomingCreditPayments = bankAccounts
    .filter(account => account.type === "Credit Card" || account.type === "Credit Simple")
    .map(account => ({
      accountId: account.id,
      accountName: account.name,
      amount: Math.abs(account.balance || 0), // Convert negative balance to positive amount for payment
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 30 days from now
      type: account.type
    }));

  // Combined historical data
  const historicalData: ForecastHistoricalData = {
    payables,
    receivables,
    expenses,
    sales,
    bankAccounts,
    availableCashBalance,
    creditLiabilities,
    netPosition,
    upcomingCreditPayments
  };

  return {
    historicalData,
    isLoading: isLoadingBankAccounts, // Use bankAccounts loading state as indicator
    payables,
    receivables,
    expenses,
    sales,
    bankAccounts,
    availableCashBalance,
    creditLiabilities,
    netPosition,
    upcomingCreditPayments
  };
}
