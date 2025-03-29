
import { BankAccount } from "@/components/banking/types";
import { Transaction, TransactionRow } from "../TransactionRow";
import { TableBody } from "@/components/ui/table";

interface TransactionsListProps {
  account: BankAccount;
  currentTransactions: Transaction[];
  currentPage: number;
}

export function TransactionsList({ account, currentTransactions, currentPage }: TransactionsListProps) {
  return (
    <TableBody>
      {/* Transaction Rows for current page only */}
      {currentTransactions.map((transaction) => (
        <TransactionRow 
          key={transaction.id} 
          transaction={transaction}
        />
      ))}
    </TableBody>
  );
}
