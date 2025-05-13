
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ForecastHistoricalData, BalanceHistoryEntry } from "@/types/cashFlow";
import { BankAccount } from "@/components/banking/types";
import { addDays, format, subDays, isBefore, parseISO } from "date-fns";

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

  // Fetch receivables data (directly from Sales table)
  const { data: receivables = [] } = useQuery({
    queryKey: ["accounts-receivable"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Sales")
        .select("*")
        .or('statusPaid.eq.por cobrar,statusPaid.is.null,statusPaid.eq.');
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

  // Fetch credit payment schedules
  const { data: creditPaymentSchedules = [], isLoading: isLoadingCreditPayments } = useQuery({
    queryKey: ["credit-payment-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_payment_schedules")
        .select("*")
        .eq("status", "pending")
        .order("due_date", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
  
  // Fetch balance history data (for the last 30 days)
  const { data: balanceHistory = [], isLoading: isLoadingBalanceHistory } = useQuery({
    queryKey: ["balance-history"],
    queryFn: async () => {
      // In a real implementation, we would fetch this from a dedicated table
      // For now, we'll simulate balance history with the current balance
      
      const today = new Date();
      const simulatedHistory: BalanceHistoryEntry[] = [];
      
      // Generate simulated balance history for the last 30 days
      for (let i = 0; i < 30; i++) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        
        // Add some variation to simulate changing balances
        const variationFactor = 1 + (Math.random() * 0.1 - 0.05); // +/- 5%
        
        simulatedHistory.push({
          date,
          availableCashBalance: calculateAvailableCashBalance(bankAccounts) * variationFactor,
          creditLiabilities: calculateCreditLiabilities(bankAccounts) * variationFactor,
          netPosition: calculateNetPosition(bankAccounts) * variationFactor,
          // Simulate that more recent data is confirmed, older may not be
          is_confirmed: i < 7 // Only the last 7 days are confirmed
        });
      }
      
      return simulatedHistory.sort((a, b) => 
        isBefore(parseISO(a.date), parseISO(b.date)) ? -1 : 1
      );
    },
    enabled: !isLoadingBankAccounts && bankAccounts.length > 0
  });
  
  // Calculate different types of balances
  const availableCashBalance = calculateAvailableCashBalance(bankAccounts);
  const creditLiabilities = calculateCreditLiabilities(bankAccounts);
  const netPosition = calculateNetPosition(bankAccounts);

  // Helper functions to calculate balances
  function calculateAvailableCashBalance(accounts: BankAccount[]): number {
    return accounts
      .filter(account => account.type === "Bank" || account.type === "Cash")
      .reduce((sum, account) => sum + (account.balance || 0), 0);
  }
  
  function calculateCreditLiabilities(accounts: BankAccount[]): number {
    return accounts
      .filter(account => account.type === "Credit Card" || account.type === "Credit Simple")
      .reduce((sum, account) => sum + (account.balance || 0), 0);
  }
  
  function calculateNetPosition(accounts: BankAccount[]): number {
    return calculateAvailableCashBalance(accounts) + calculateCreditLiabilities(accounts);
  }

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
  console.log("[DEBUG - Balance Tracking] Balance History Entries:", balanceHistory.length);

  // Get upcoming credit payments from payment schedules
  const upcomingCreditPayments = creditPaymentSchedules.map(payment => {
    // Find the associated account
    const account = bankAccounts.find(acc => acc.id === payment.account_id);
    return {
      accountId: payment.account_id,
      accountName: account?.name || 'Cuenta desconocida',
      amount: payment.amount,
      dueDate: payment.due_date,
      type: account?.type || 'Unknown'
    };
  });

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
    upcomingCreditPayments,
    balance_history: balanceHistory
  };

  return {
    historicalData,
    isLoading: isLoadingBankAccounts || isLoadingBalanceHistory || isLoadingCreditPayments,
    payables,
    receivables,
    expenses,
    sales,
    bankAccounts,
    availableCashBalance,
    creditLiabilities,
    netPosition,
    upcomingCreditPayments,
    balanceHistory
  };
}
