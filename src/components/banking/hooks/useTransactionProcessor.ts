
import { useMemo } from "react";
import { BankAccount } from "@/components/banking/types";
import { Transaction } from "./transaction-models";

export const ITEMS_PER_PAGE = 30;

export function useTransactionProcessor(account: BankAccount | null, transactions: Array<any>) {
  // Calculate running balance for each transaction, respecting the initial balance date
  return useMemo(() => {
    if (!transactions || !account) return [];
    
    // Log de entrada para rastrear datos
    console.log(`DEBUG - useTransactionProcessor entrada para cuenta ${account.id}:`, transactions);
    
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
    
    // Log específico para la transferencia del 16 de mayo antes del procesamiento
    const mayTransferBeforeProcessing = sortedTransactions.find(t => 
      t.date === '2025-05-16' && t.source === 'transfer' && t.type === 'in'
    );
    if (mayTransferBeforeProcessing) {
      console.log(`DEBUG - Transferencia del 16 mayo ANTES de procesar balance:`, mayTransferBeforeProcessing);
    }
    
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
      // Log específico para la transferencia del 16 de mayo durante el cálculo del balance
      if (transaction.date === '2025-05-16' && transaction.source === 'transfer' && transaction.type === 'in') {
        console.log(`DEBUG - Procesando transferencia del 16 mayo - ANTES del cálculo:`, {
          transaction,
          currentRunningBalance: runningBalance,
          accountCurrency: account.currency
        });
      }
      
      // Calculate amount to add/subtract based on currency
      let effectiveAmount = transaction.amount;
      
      // If transaction currency matches account currency and we have original_amount
      if (transaction.original_currency === account.currency && transaction.original_amount !== undefined) {
        effectiveAmount = transaction.original_amount;
        console.log(`DEBUG - Usando original_amount para transacción ${transaction.id}: ${effectiveAmount} (original: ${transaction.amount})`);
      }
      
      // Update running balance based on transaction type
      if (transaction.type === 'in') {
        runningBalance += effectiveAmount;
      } else {
        runningBalance -= effectiveAmount;
      }
      
      const processedTransaction = {
        ...transaction,
        runningBalance,
        beforeInitialDate: false
      };
      
      // Log específico para la transferencia del 16 de mayo después del cálculo
      if (transaction.date === '2025-05-16' && transaction.source === 'transfer' && transaction.type === 'in') {
        console.log(`DEBUG - Transferencia del 16 mayo DESPUÉS del cálculo:`, {
          processedTransaction,
          effectiveAmount,
          newRunningBalance: runningBalance
        });
      }
      
      return processedTransaction;
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
    
    // Log final para la transferencia del 16 de mayo
    const finalMayTransfer = finalTransactions.find(t => 
      t.date === '2025-05-16' && t.source === 'transfer' && t.type === 'in'
    );
    if (finalMayTransfer) {
      console.log(`DEBUG - Transferencia del 16 mayo RESULTADO FINAL:`, finalMayTransfer);
    }
    
    return finalTransactions;
  }, [transactions, account]);
}
