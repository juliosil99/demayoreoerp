
import { useState, useEffect } from "react";

interface PaginationProps<T> {
  items: T[] | null;
  itemsPerPage: number;
}

export const useInvoicePagination = <T>({ items, itemsPerPage }: PaginationProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedItems, setPaginatedItems] = useState<T[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Reset to first page when items change
    setCurrentPage(1);
  }, [items]);

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

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    handlePageChange,
  };
};
