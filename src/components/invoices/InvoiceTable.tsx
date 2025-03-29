
import React, { useMemo } from "react";
import { Table } from "@/components/ui/table";
import type { Database } from "@/integrations/supabase/types";
import { InvoiceFilters } from "./InvoiceFilters";
import { InvoiceTableHeader } from "./table/InvoiceTableHeader";
import { InvoiceTableBody } from "./table/InvoiceTableBody";
import { NoInvoicesMessage } from "./table/NoInvoicesMessage";
import { InvoicePagination } from "./pagination/InvoicePagination";
import { useInvoiceFiltering } from "./hooks/useInvoiceFiltering";
import { useInvoicePagination } from "./hooks/useInvoicePagination";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

const ITEMS_PER_PAGE = 30;

export const InvoiceTable = ({ invoices }: { invoices: Invoice[] | null }) => {
  // Handle filtering with memoized handlers
  const { filters, filteredInvoices, handleFilterChange } = useInvoiceFiltering(invoices);
  
  // Handle pagination with memoized data
  const { currentPage, totalPages, paginatedItems, handlePageChange } = useInvoicePagination({
    items: filteredInvoices,
    itemsPerPage: ITEMS_PER_PAGE
  });

  // Memoize the check for showing pagination
  const showPagination = useMemo(() => {
    return filteredInvoices && filteredInvoices.length > 0 && totalPages > 1;
  }, [filteredInvoices, totalPages]);

  // Memoize the check for showing no invoices message
  const showNoInvoicesMessage = useMemo(() => {
    return !filteredInvoices || filteredInvoices.length === 0;
  }, [filteredInvoices]);
  
  return (
    <div className="space-y-4">
      <InvoiceFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      <Table>
        <InvoiceTableHeader />
        <InvoiceTableBody invoices={paginatedItems} />
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
    </div>
  );
};
