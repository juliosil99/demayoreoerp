
import { BankAccount } from "@/components/banking/types";
import { Transaction, TransactionRow } from "../TransactionRow";
import { TableBody } from "@/components/ui/table";
import { InitialBalanceRow } from "./InitialBalanceRow";

interface TransactionsListProps {
  account: BankAccount;
  currentTransactions: Transaction[];
  currentPage: number;
}

export function TransactionsList({ account, currentTransactions, currentPage }: TransactionsListProps) {
  return (
    <TableBody>
      {/* Initial Balance Row - only show on first page */}
      {currentPage === 1 && <InitialBalanceRow account={account} />}
      
      {/* Transaction Rows for current page only */}
      {currentTransactions.map((transaction) => (
        <TransactionRow 
          key={`${transaction.source}-${transaction.id}`} 
          transaction={transaction}
        />
      ))}
    </TableBody>
  );
}
