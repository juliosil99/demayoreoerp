
import { useState, useMemo } from 'react';
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

interface UsePaginationProps {
  items: Invoice[] | null | undefined;
  itemsPerPage: number;
}

export const useInvoicePagination = ({ items, itemsPerPage }: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = useMemo(() => {
    return items ? Math.ceil(items.length / itemsPerPage) : 0;
  }, [items, itemsPerPage]);
  
  const paginatedItems = useMemo(() => {
    if (!items) return null;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  // Reset to page 1 when filters change (items array reference changes)
  useMemo(() => {
    setCurrentPage(1);
  }, [items]);
  
  return {
    currentPage,
    totalPages,
    paginatedItems,
    handlePageChange
  };
};
