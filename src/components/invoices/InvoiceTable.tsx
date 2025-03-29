
import React from "react";
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
  // Handle filtering
  const { filters, filteredInvoices, handleFilterChange } = useInvoiceFiltering(invoices);
  
  // Handle pagination
  const { currentPage, totalPages, paginatedItems, handlePageChange } = useInvoicePagination({
    items: filteredInvoices,
    itemsPerPage: ITEMS_PER_PAGE
  });
  
  return (
    <div className="space-y-4">
      <InvoiceFilters filters={filters} onFilterChange={handleFilterChange} />
      
      <Table>
        <InvoiceTableHeader />
        <InvoiceTableBody invoices={paginatedItems} />
      </Table>

      {filteredInvoices && filteredInvoices.length > 0 ? (
        totalPages > 1 && (
          <InvoicePagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )
      ) : (
        <NoInvoicesMessage />
      )}
    </div>
  );
};
