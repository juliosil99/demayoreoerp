
import { useMemo } from "react";
import { BankAccount } from "@/components/banking/types";
import { Transaction } from "./transaction-models";

export const ITEMS_PER_PAGE = 30;

export function useTransactionProcessor(account: BankAccount | null, transactions: Array<any>) {
  // Calculate running balance for each transaction, respecting the initial balance date
  return useMemo(() => {
    if (!transactions || !account) return [];
    
    // Create a copy of transactions with initial balance included
    const allTransactions = [...transactions];
    
    // Create an initial balance "transaction" entry
    const initialBalanceTransaction = {
      id: "initial-balance",
      date: account.balance_date,
      description: "Saldo Inicial",
      reference: "-",
      type: "initial", // Special type for initial balance
      amount: account.initial_balance || 0,
      isInitialBalance: true,
    };
    
    // Add initial balance to transactions array
    allTransactions.push(initialBalanceTransaction);
    
    // Sort all transactions by date (newest first for display)
    const sortedTransactions = [...allTransactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const balanceDate = account.balance_date ? new Date(account.balance_date) : new Date();
    const initialBalance = account.initial_balance || 0;
    
    // Split transactions into two groups: before and after the initial balance date
    const transactionsBeforeBalanceDate = [];
    const transactionsAfterBalanceDate = [];
    
    for (const transaction of sortedTransactions) {
      if (transaction.isInitialBalance) {
        transactionsAfterBalanceDate.push(transaction);
        continue;
      }
      
      const transactionDate = new Date(transaction.date);
      if (transactionDate < balanceDate) {
        transactionsBeforeBalanceDate.push(transaction);
      } else {
        transactionsAfterBalanceDate.push(transaction);
      }
    }
    
    // Process transactions before balance date (they won't affect running balance)
    const processedTransactionsBefore = transactionsBeforeBalanceDate.map(transaction => ({
      ...transaction,
      runningBalance: null, // No running balance for these
      beforeInitialDate: true
    }));
    
    // Sort transactions after balance date by date (oldest first) for running balance calculation
    // but exclude the initial balance transaction which will be handled separately
    const transactionsAfterWithoutInitial = transactionsAfterBalanceDate.filter(t => !t.isInitialBalance);
    const initialBalanceEntry = transactionsAfterBalanceDate.find(t => t.isInitialBalance);
    
    const sortedTransactionsAfter = [...transactionsAfterWithoutInitial].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Process transactions after balance date (they will affect running balance)
    let runningBalance = initialBalance;
    const processedTransactionsAfter = sortedTransactionsAfter.map(transaction => {
      // Para transferencias, usar directamente el amount sin conversiones adicionales
      let effectiveAmount = transaction.amount;
      
      // Update running balance based on transaction type
      if (transaction.type === 'in') {
        runningBalance += effectiveAmount;
      } else {
        runningBalance -= effectiveAmount;
      }
      
      return {
        ...transaction,
        runningBalance,
        beforeInitialDate: false
      };
    });
    
    // Get processed transactions after but reverse them to display newest first
    // while preserving the correctly calculated running balance
    const reversedProcessedTransactionsAfter = [...processedTransactionsAfter].reverse();
    
    // Insert the initial balance transaction at its correct position
    let finalTransactions = [...reversedProcessedTransactionsAfter, ...processedTransactionsBefore];
    
    if (initialBalanceEntry) {
      // Convert initial balance entry to the proper format
      const formattedInitialBalanceEntry = {
        ...initialBalanceEntry,
        runningBalance: initialBalance,
        beforeInitialDate: false
      };
      
      // Find the correct position for the initial balance entry
      // by comparing dates (it should be after newer transactions and before older ones)
      let inserted = false;
      
      // Find the correct insertion point
      for (let i = 0; i < finalTransactions.length; i++) {
        const transaction = finalTransactions[i];
        const transactionDate = new Date(transaction.date);
        const initialBalanceDate = new Date(formattedInitialBalanceEntry.date);
        
        if (transactionDate <= initialBalanceDate) {
          // Insert initial balance before this transaction
          finalTransactions.splice(i, 0, formattedInitialBalanceEntry);
          inserted = true;
          break;
        }
      }
      
      // If not inserted, add to the end
      if (!inserted) {
        finalTransactions.push(formattedInitialBalanceEntry);
      }
    }
    
    return finalTransactions;
  }, [transactions, account]);
}
