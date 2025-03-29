
import { useMemo, useState } from "react";
import { BankAccount } from "@/components/banking/types";
import { Transaction, TransactionRow } from "./TransactionRow";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useSyncAccountBalance } from "./hooks/useSyncAccountBalance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TransactionsTableProps {
  account: BankAccount;
  transactions: Array<any>;
}

// Number of transactions to show per page
const ITEMS_PER_PAGE = 30;

export function TransactionsTable({ account, transactions }: TransactionsTableProps) {
  // State for current page (1-based index)
  const [currentPage, setCurrentPage] = useState(1);
  
  // Use the synchronization hook to ensure balance is correct
  useSyncAccountBalance(account, transactions);
  
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

  // Calculate the total number of pages
  const totalPages = Math.ceil(transactionsWithBalance.length / ITEMS_PER_PAGE);
  
  // Get current page of transactions
  const currentTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return transactionsWithBalance.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [transactionsWithBalance, currentPage]);
  
  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the table
    window.scrollTo(0, 0);
  };
  
  // Generate page numbers to display (always show first, last, and pages around current)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      // If we have 7 or fewer pages, show all page numbers
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Always include first, last, and pages around current
    const pageNumbers = [1];
    
    // Calculate range around current page
    let rangeStart = Math.max(2, currentPage - 1);
    let rangeEnd = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust range to always show 3 pages
    if (rangeEnd - rangeStart < 2) {
      if (rangeStart === 2) {
        rangeEnd = Math.min(4, totalPages - 1);
      } else {
        rangeStart = Math.max(2, totalPages - 3);
      }
    }
    
    // Add ellipsis if needed before range
    if (rangeStart > 2) {
      pageNumbers.push(-1); // Use -1 to represent ellipsis
    }
    
    // Add range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis if needed after range
    if (rangeEnd < totalPages - 1) {
      pageNumbers.push(-2); // Use -2 to represent second ellipsis
    }
    
    // Add last page
    pageNumbers.push(totalPages);
    
    return pageNumbers;
  };

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
    <div className="space-y-4">
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
            
            {/* Transaction Rows for current page only */}
            {currentTransactions.map((transaction) => (
              <TransactionRow 
                key={`${transaction.source}-${transaction.id}`} 
                transaction={transaction}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            {/* Previous Page Button */}
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {/* Page Numbers */}
            {getPageNumbers().map((pageNumber, index) => (
              pageNumber < 0 ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pageNumber);
                    }}
                    isActive={pageNumber === currentPage}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            ))}
            
            {/* Next Page Button */}
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
