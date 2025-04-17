
import { useMemo, useState } from "react";
import { ITEMS_PER_PAGE, useTransactionProcessor } from "./useTransactionProcessor";
import { BankAccount } from "../types";

export function usePaginatedTransactions(account: BankAccount, transactions: Array<any>) {
  // State for current page (1-based index)
  const [currentPage, setCurrentPage] = useState(1);
  
  // Process transactions with running balance calculation
  const transactionsWithBalance = useTransactionProcessor(account, transactions);
  
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

  return {
    currentPage,
    totalPages,
    currentTransactions,
    handlePageChange
  };
}
