
import { useState, useCallback } from 'react';
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

interface InvoiceFilters {
  search: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  invoiceType: string;
  minAmount: string;
  maxAmount: string;
}

export const useInvoiceFiltering = (invoices: Invoice[] | null) => {
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: "",
    dateFrom: undefined,
    dateTo: undefined,
    invoiceType: "",
    minAmount: "",
    maxAmount: "",
  });

  const handleFilterChange = useCallback((newFilters: InvoiceFilters) => {
    setFilters(newFilters);
  }, []);

  const searchInvoice = useCallback((invoice: Invoice, searchTerm: string): boolean => {
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
  }, []);

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

  return {
    filters,
    filteredInvoices,
    handleFilterChange
  };
};
