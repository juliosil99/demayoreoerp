
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FileText, Check, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { InvoiceFilters } from "./InvoiceFilters";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

const ITEMS_PER_PAGE = 30;

export const InvoiceTable = ({ invoices }: { invoices: Invoice[] | null }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: undefined,
    dateTo: undefined,
    invoiceType: "",
    minAmount: "",
    maxAmount: "",
  });
  
  console.log("Received invoices data:", invoices);
  
  const getStatusIcon = (status: string | null) => {
    if (status === 'completed') return <Check className="h-4 w-4 text-green-500" />;
    if (status === 'error') return <X className="h-4 w-4 text-red-500" />;
    return null;
  };

  // Function to format amount based on invoice type
  const formatAmount = (invoice: Invoice) => {
    if (!invoice.total_amount) return "-";
    
    // If it's a credit note (type E), show as negative amount
    const amount = invoice.invoice_type === 'E' 
      ? -1 * invoice.total_amount 
      : invoice.total_amount;
      
    return `${invoice.currency || "MXN"} ${amount.toFixed(2)}`;
  };

  // Function to format tax amount based on invoice type
  const formatTaxAmount = (invoice: Invoice) => {
    if (!invoice.tax_amount) return "-";
    
    // If it's a credit note (type E), show as negative amount
    const amount = invoice.invoice_type === 'E' 
      ? -1 * invoice.tax_amount 
      : invoice.tax_amount;
      
    return `${invoice.currency || "MXN"} ${amount.toFixed(2)}`;
  };

  // Filter invoices based on selected filters
  const filteredInvoices = invoices?.filter(invoice => {
    // Search filter
    if (filters.search && !searchInvoice(invoice, filters.search)) {
      return false;
    }

    // Invoice type filter
    if (filters.invoiceType && filters.invoiceType !== "all" && invoice.invoice_type !== filters.invoiceType) {
      return false;
    }

    // Date range filter
    if (filters.dateFrom && invoice.invoice_date) {
      const invoiceDate = new Date(invoice.invoice_date);
      if (invoiceDate < filters.dateFrom) {
        return false;
      }
    }

    if (filters.dateTo && invoice.invoice_date) {
      const invoiceDate = new Date(invoice.invoice_date);
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      if (invoiceDate > endDate) {
        return false;
      }
    }

    // Amount range filter
    if (filters.minAmount && invoice.total_amount) {
      const minAmount = parseFloat(filters.minAmount);
      if (invoice.total_amount < minAmount) {
        return false;
      }
    }

    if (filters.maxAmount && invoice.total_amount) {
      const maxAmount = parseFloat(filters.maxAmount);
      if (invoice.total_amount > maxAmount) {
        return false;
      }
    }

    return true;
  });

  function searchInvoice(invoice: Invoice, searchTerm: string): boolean {
    const searchLower = searchTerm.toLowerCase();
    return (
      (invoice.issuer_name?.toLowerCase().includes(searchLower) || false) ||
      (invoice.issuer_rfc?.toLowerCase().includes(searchLower) || false) ||
      (invoice.receiver_name?.toLowerCase().includes(searchLower) || false) ||
      (invoice.receiver_rfc?.toLowerCase().includes(searchLower) || false) ||
      (invoice.invoice_number?.toLowerCase().includes(searchLower) || false) ||
      (invoice.serie?.toLowerCase().includes(searchLower) || false) ||
      (invoice.filename?.toLowerCase().includes(searchLower) || false)
    );
  }

  // Calculate pagination
  const totalPages = filteredInvoices ? Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInvoices = filteredInvoices?.slice(startIndex, endIndex);

  // When filters change, reset to first page
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      <InvoiceFilters filters={filters} onFilterChange={handleFilterChange} />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre del Archivo</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Número de Factura</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Emisor</TableHead>
            <TableHead>Receptor</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="text-right">Impuesto</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentInvoices?.map((invoice) => {
            console.log("Processing invoice:", invoice);
            
            return (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {invoice.filename}
                  </div>
                </TableCell>
                <TableCell>
                  {invoice.invoice_date 
                    ? new Date(invoice.invoice_date).toLocaleDateString()
                    : new Date(invoice.created_at || "").toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {invoice.serie 
                    ? `${invoice.serie}-${invoice.invoice_number}` 
                    : invoice.invoice_number || "-"}
                </TableCell>
                <TableCell>
                  {invoice.invoice_type === 'E' 
                    ? 'Egreso (Nota de Crédito)'
                    : invoice.invoice_type === 'I'
                      ? 'Ingreso'
                      : invoice.invoice_type === 'P'
                        ? 'Pago'
                        : invoice.invoice_type === 'N'
                          ? 'Nómina'
                          : invoice.invoice_type || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{invoice.issuer_name || "-"}</span>
                    <span className="text-xs text-muted-foreground">{invoice.issuer_rfc}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{invoice.receiver_name || "-"}</span>
                    <span className="text-xs text-muted-foreground">{invoice.receiver_rfc}</span>
                  </div>
                </TableCell>
                <TableCell className={`text-right ${invoice.invoice_type === 'E' ? 'text-red-600 font-medium' : ''}`}>
                  {formatAmount(invoice)}
                </TableCell>
                <TableCell className={`text-right ${invoice.invoice_type === 'E' ? 'text-red-600 font-medium' : ''}`}>
                  {formatTaxAmount(invoice)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(invoice.status)}
                    <span>{invoice.status === 'completed' ? 'Completado' : 
                           invoice.status === 'error' ? 'Error' : 
                           invoice.status}</span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {filteredInvoices && filteredInvoices.length > 0 ? (
        totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {getPageNumbers().map((pageNumber, index) => (
                <PaginationItem key={index}>
                  {pageNumber === '...' ? (
                    <span className="px-4 py-2">...</span>
                  ) : (
                    <PaginationLink
                      onClick={() => setCurrentPage(Number(pageNumber))}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No se encontraron facturas que coincidan con los filtros aplicados.</p>
        </div>
      )}
    </div>
  );
};
