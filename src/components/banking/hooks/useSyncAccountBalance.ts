
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { BankAccount } from "@/components/banking/types";
import { AccountTransaction } from "./useAccountTransactions";
import { toast } from "sonner";

export function useSyncAccountBalance(
  account: BankAccount | null, 
  transactions: AccountTransaction[] | undefined
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!account || !transactions || transactions.length === 0) return;

    // Find the most recent transaction after the initial balance date
    const accountBalanceDate = new Date(account.balance_date);
    
    // Filter transactions after the balance date
    const validTransactions = transactions.filter(
      transaction => new Date(transaction.date) >= accountBalanceDate
    );
    
    if (validTransactions.length === 0) return;
    
    // Sort by date (newest first)
    const sortedTransactions = [...validTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Calculate the latest balance
    const latestTransaction = sortedTransactions[0];
    let calculatedBalance = account.initial_balance;
    
    // We need to iterate transactions chronologically to calculate the balance
    const chronologicalTransactions = [...sortedTransactions].reverse();
    for (const transaction of chronologicalTransactions) {
      if (transaction.type === 'in') {
        calculatedBalance += transaction.amount;
      } else {
        calculatedBalance -= transaction.amount;
      }
    }
    
    // Add logging to see the balance calculation
    console.log(`Account balance calculation for ${account.name} (${account.id}):`, {
      initialBalance: account.initial_balance,
      calculatedBalance: calculatedBalance,
      currentStoredBalance: account.balance,
      difference: calculatedBalance - account.balance,
      balanceDate: accountBalanceDate,
      transactionCount: chronologicalTransactions.length
    });
    
    // If the balance in the database is different from calculated balance by more than a penny,
    // update the database
    if (Math.abs(calculatedBalance - account.balance) > 0.01) {
      // Log sync operation
      console.log(`Account balance synchronized: ${account.balance} → ${calculatedBalance}`);
      
      // Update the account balance in the database
      const updateBalance = async () => {
        try {
          const { error } = await supabase
            .from("bank_accounts")
            .update({ balance: calculatedBalance })
            .eq("id", account.id);
            
          if (error) {
            console.error("Error updating account balance:", error);
            return;
          }
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
          queryClient.invalidateQueries({ queryKey: ["bank-account", account.id] });
          
          // Log successful update
          console.log(`Account balance updated in database: ${account.name} (ID: ${account.id}): ${calculatedBalance}`);
        } catch (error) {
          console.error("Error in balance synchronization:", error);
        }
      };
      
      updateBalance();
    }
  }, [account, transactions, queryClient]);
}
