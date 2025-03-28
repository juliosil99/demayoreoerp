
import { useMemo } from "react";
import { BankAccount } from "@/components/banking/types";
import { Transaction, TransactionRow } from "./TransactionRow";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TransactionsTableProps {
  account: BankAccount;
  transactions: Array<any>;
}

export function TransactionsTable({ account, transactions }: TransactionsTableProps) {
  // Calculate running balance for each transaction, respecting the initial balance date
  const transactionsWithBalance = useMemo(() => {
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

  if (!transactionsWithBalance || transactionsWithBalance.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <h3 className="text-lg font-medium">No hay movimientos</h3>
        <p className="text-muted-foreground">
          Esta cuenta no tiene movimientos registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Referencia</TableHead>
            <TableHead className="text-right">Tipo</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="text-right font-medium">Saldo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Initial Balance Row */}
          <TableRow className="bg-muted/20 font-medium">
            <TableCell>{formatDate(account.balance_date)}</TableCell>
            <TableCell>Saldo Inicial</TableCell>
            <TableCell>-</TableCell>
            <TableCell className="text-right">-</TableCell>
            <TableCell className="text-right">{formatCurrency(account.initial_balance || 0)}</TableCell>
            <TableCell className="text-right">{formatCurrency(account.initial_balance || 0)}</TableCell>
          </TableRow>
          
          {/* Transaction Rows */}
          {transactionsWithBalance.map((transaction) => (
            <TransactionRow 
              key={`${transaction.source}-${transaction.id}`} 
              transaction={transaction}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
