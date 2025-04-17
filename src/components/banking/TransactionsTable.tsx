
import { BankAccount } from "@/components/banking/types";
import { useSyncAccountBalance } from "./hooks/useSyncAccountBalance";
import { Table } from "@/components/ui/table";
import { TransactionTableHeader } from "./components/TransactionTableHeader";
import { TransactionsList } from "./components/TransactionsList";
import { TransactionsPagination } from "./components/TransactionsPagination";
import { TransactionsEmptyState } from "./components/TransactionsEmptyState";
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions";

interface TransactionsTableProps {
  account: BankAccount;
  transactions: Array<any>;
}

export function TransactionsTable({ account, transactions }: TransactionsTableProps) {
  // Use the synchronization hook to ensure balance is correct
  useSyncAccountBalance(account, transactions);
  
  // Use pagination hook to manage transactions
  const { 
    currentPage, 
    totalPages, 
    currentTransactions, 
    handlePageChange 
  } = usePaginatedTransactions(account, transactions);

  if (!transactions || transactions.length === 0) {
    return <TransactionsEmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TransactionTableHeader />
          <TransactionsList 
            account={account}
            currentTransactions={currentTransactions}
            currentPage={currentPage}
          />
        </Table>
      </div>
      
      {/* Pagination */}
      <TransactionsPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
