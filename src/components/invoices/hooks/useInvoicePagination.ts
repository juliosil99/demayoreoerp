
import { useState, useEffect, useCallback } from "react";

interface PaginationProps<T> {
  items: T[] | null;
  itemsPerPage: number;
}

export const useInvoicePagination = <T>({ items, itemsPerPage }: PaginationProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedItems, setPaginatedItems] = useState<T[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  // Update paginated items when page or items change
  useEffect(() => {
    if (!items || items.length === 0) {
      setPaginatedItems([]);
      setTotalPages(1);
      return;
    }

    const totalPagesCount = Math.ceil(items.length / itemsPerPage);
    setTotalPages(totalPagesCount);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);
    setPaginatedItems(items.slice(startIndex, endIndex));
  }, [items, currentPage, itemsPerPage]);

  // Memoize page change handler
  const handlePageChange = useCallback((pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  }, [totalPages]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    handlePageChange,
  };
};
