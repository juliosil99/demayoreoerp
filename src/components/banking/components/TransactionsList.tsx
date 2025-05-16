
import { BankAccount } from "@/components/banking/types";
import { Transaction } from "../hooks/transaction-models";
import { TransactionRowItem } from "./TransactionRowItem";
import { TableBody } from "@/components/ui/table";
import { useState, useEffect } from "react";

interface TransactionsListProps {
  account: BankAccount;
  currentTransactions: Transaction[];
  currentPage: number;
}

export function TransactionsList({ account, currentTransactions, currentPage }: TransactionsListProps) {
  // Add error state to handle any rendering issues gracefully
  const [hasRenderError, setHasRenderError] = useState(false);

  // Reset error state when transactions change
  useEffect(() => {
    setHasRenderError(false);
  }, [currentTransactions]);

  // Show friendly error message if there's a rendering problem
  if (hasRenderError) {
    return (
      <TableBody>
        <tr>
          <td colSpan={6} className="py-4 text-center text-muted-foreground">
            Ocurrió un error al mostrar las transacciones. Por favor, intente de nuevo.
          </td>
        </tr>
      </TableBody>
    );
  }

  try {
    return (
      <TableBody>
        {currentTransactions.map((transaction) => (
          <TransactionRowItem 
            key={transaction.id} 
            transaction={transaction}
            account={account}
          />
        ))}
      </TableBody>
    );
  } catch (error) {
    // Log error internally but don't expose details to the UI
    console.error("Error rendering transactions list:", error);
    setHasRenderError(true);
    
    // Return a clean fallback UI
    return (
      <TableBody>
        <tr>
          <td colSpan={6} className="py-4 text-center text-muted-foreground">
            Ocurrió un error al mostrar las transacciones. Por favor, intente de nuevo.
          </td>
        </tr>
      </TableBody>
    );
  }
}
