
import { useState, useCallback } from "react";

export const useOptimizedInvoicePagination = (itemsPerPage: number = 30) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = useCallback((pageNumber: number) => {
    if (pageNumber < 1) return;
    setCurrentPage(pageNumber);
  }, []);

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    itemsPerPage,
    handlePageChange,
    resetToFirstPage,
  };
};
