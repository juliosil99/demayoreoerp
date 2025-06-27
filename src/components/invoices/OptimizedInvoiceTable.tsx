
import React, { useEffect } from "react";
import { Table } from "@/components/ui/table";
import type { Database } from "@/integrations/supabase/types";
import { InvoiceFilters } from "./InvoiceFilters";
import { OptimizedInvoiceTableHeader } from "./table/OptimizedInvoiceTableHeader";
import { OptimizedInvoiceTableBody } from "./table/OptimizedInvoiceTableBody";
import { NoInvoicesMessage } from "./table/NoInvoicesMessage";
import { InvoicePagination } from "./pagination/InvoicePagination";
import { useOptimizedInvoices } from "@/hooks/invoices/useOptimizedInvoices";
import { useOptimizedInvoiceFiltering } from "./hooks/useOptimizedInvoiceFiltering";
import { useOptimizedInvoicePagination } from "./hooks/useOptimizedInvoicePagination";
import { Skeleton } from "@/components/ui/skeleton";

type PartialInvoice = Partial<Database["public"]["Tables"]["invoices"]["Row"]>;

const ITEMS_PER_PAGE = 30;

export const OptimizedInvoiceTable = () => {
  const { filters, handleFilterChange } = useOptimizedInvoiceFiltering();
  const { currentPage, handlePageChange, resetToFirstPage } = useOptimizedInvoicePagination(ITEMS_PER_PAGE);
  
  const { invoices, totalCount, isLoading, error } = useOptimizedInvoices({
    page: currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    filters
  });

  // Reset to first page when filters change
  useEffect(() => {
    resetToFirstPage();
  }, [filters, resetToFirstPage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const showPagination = totalCount > 0 && totalPages > 1;
  const showNoInvoicesMessage = !isLoading && invoices.length === 0;

  if (error) {
    return (
      <div className="space-y-4">
        <InvoiceFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
        <div className="text-center text-red-600 p-4">
          Error loading invoices: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InvoiceFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <>
          <Table>
            <OptimizedInvoiceTableHeader />
            <OptimizedInvoiceTableBody invoices={invoices} />
          </Table>

          {showPagination && (
            <InvoicePagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {showNoInvoicesMessage && (
            <NoInvoicesMessage />
          )}
        </>
      )}
    </div>
  );
};
