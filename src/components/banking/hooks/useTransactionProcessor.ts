
import { useMemo } from "react";
import { BankAccount } from "@/components/banking/types";
import { Transaction } from "../TransactionRow";

export const ITEMS_PER_PAGE = 30;

export function useTransactionProcessor(account: BankAccount | null, transactions: Array<any>) {
  // Calculate running balance for each transaction, respecting the initial balance date
  return useMemo(() => {
    if (!transactions || !account) return [];
    
    const balanceDate = account.balance_date ? new Date(account.balance_date) : new Date();
    const initialBalance = account.initial_balance || 0;
    
    // Split transactions into two groups: before and after the initial balance date
    const transactionsBeforeBalanceDate = [];
    const transactionsAfterBalanceDate = [];
    
    for (const transaction of transactions) {
      const transactionDate = new Date(transaction.date);
      if (transactionDate < balanceDate) {
        transactionsBeforeBalanceDate.push(transaction);
      } else {
        transactionsAfterBalanceDate.push(transaction);
      }
    }
    
    // Sort transactions before balance date by date (newest first)
    const sortedTransactionsBefore = [...transactionsBeforeBalanceDate].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Process transactions before balance date (they won't affect running balance)
    const processedTransactionsBefore = sortedTransactionsBefore.map(transaction => ({
      ...transaction,
      runningBalance: null, // No running balance for these
      beforeInitialDate: true
    }));
    
    // Sort transactions after balance date by date (oldest first) for running balance calculation
    const sortedTransactionsAfter = [...transactionsAfterBalanceDate].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Process transactions after balance date (they will affect running balance)
    let runningBalance = initialBalance;
    const processedTransactionsAfter = sortedTransactionsAfter.map(transaction => {
      // Update running balance based on transaction type
      if (transaction.type === 'in') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
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
    
    // Combine all transactions with newest first
    return [...reversedProcessedTransactionsAfter, ...processedTransactionsBefore];
  }, [transactions, account]);
}
