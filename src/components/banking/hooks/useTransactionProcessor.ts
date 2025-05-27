
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
    
    // Validación crítica: verificar que las transferencias TO tengan tipo 'in'
    const transfersTo = transactions.filter(t => t.source === 'transfer' && t.type === 'in');
    console.log(`DEBUG - Transferencias TO (entrantes) encontradas:`, transfersTo);
    
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
    
    // Validación específica para la transferencia del 16 de mayo
    const mayTransfer = sortedTransactions.find(t => 
      t.date === '2025-05-16' && t.source === 'transfer'
    );
    if (mayTransfer) {
      console.log(`DEBUG - CRÍTICO - Transferencia del 16 mayo en sortedTransactions:`, {
        id: mayTransfer.id,
        amount: mayTransfer.amount,
        type: mayTransfer.type,
        source: mayTransfer.source,
        description: mayTransfer.description
      });
      
      // VERIFICACIÓN: la transferencia DEBE ser tipo 'in' con monto 1506.22
      if (mayTransfer.type !== 'in' || mayTransfer.amount !== 1506.22) {
        console.error(`ERROR - Transferencia del 16 mayo tiene valores incorrectos:`, mayTransfer);
      }
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
      // Validación específica para transferencias entrantes
      if (transaction.source === 'transfer' && transaction.type === 'in') {
        console.log(`DEBUG - Procesando transferencia entrante:`, {
          id: transaction.id,
          date: transaction.date,
          amount: transaction.amount,
          type: transaction.type,
          currentRunningBalance: runningBalance
        });
      }
      
      // Para transferencias, usar directamente el amount sin conversiones adicionales
      let effectiveAmount = transaction.amount;
      
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
      if (transaction.date === '2025-05-16' && transaction.source === 'transfer') {
        console.log(`DEBUG - FINAL - Transferencia del 16 mayo procesada:`, {
          id: transaction.id,
          originalAmount: transaction.amount,
          effectiveAmount,
          type: transaction.type,
          newRunningBalance: runningBalance,
          processedTransaction
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
    
    // Validación final para la transferencia del 16 de mayo
    const finalMayTransfer = finalTransactions.find(t => 
      t.date === '2025-05-16' && t.source === 'transfer'
    );
    if (finalMayTransfer) {
      console.log(`DEBUG - RESULTADO FINAL transferencia del 16 mayo:`, {
        id: finalMayTransfer.id,
        amount: finalMayTransfer.amount,
        type: finalMayTransfer.type,
        runningBalance: finalMayTransfer.runningBalance,
        description: finalMayTransfer.description
      });
    }
    
    return finalTransactions;
  }, [transactions, account]);
}
