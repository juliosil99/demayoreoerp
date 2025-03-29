
import React, { useState, useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";
import type { InvoiceFilters } from "../InvoiceFilters";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

export const useInvoiceFiltering = (invoices: Invoice[] | null) => {
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: "",
    dateFrom: undefined,
    dateTo: undefined,
    invoiceType: "",
    minAmount: "",
    maxAmount: "",
  });

  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[] | null>(invoices);

  useEffect(() => {
    if (!invoices) {
      setFilteredInvoices(null);
      return;
    }

    let results = [...invoices];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (invoice) =>
          (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(searchLower)) ||
          (invoice.issuer_name && invoice.issuer_name.toLowerCase().includes(searchLower)) ||
          (invoice.receiver_name && invoice.receiver_name.toLowerCase().includes(searchLower)) ||
          (invoice.uuid && invoice.uuid.toLowerCase().includes(searchLower))
      );
    }

    // Apply date range filter
    if (filters.dateFrom) {
      results = results.filter(
        (invoice) => 
          invoice.invoice_date && 
          new Date(invoice.invoice_date) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      results = results.filter(
        (invoice) => 
          invoice.invoice_date && 
          new Date(invoice.invoice_date) <= new Date(filters.dateTo!)
      );
    }

    // Apply invoice type filter
    if (filters.invoiceType) {
      results = results.filter(
        (invoice) => invoice.invoice_type === filters.invoiceType
      );
    }

    // Apply amount filters
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      if (!isNaN(minAmount)) {
        results = results.filter(
          (invoice) => (invoice.total_amount || 0) >= minAmount
        );
      }
    }

    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      if (!isNaN(maxAmount)) {
        results = results.filter(
          (invoice) => (invoice.total_amount || 0) <= maxAmount
        );
      }
    }

    setFilteredInvoices(results);
  }, [invoices, filters]);

  const handleFilterChange = (newFilters: InvoiceFilters) => {
    setFilters(newFilters);
  };

  return {
    filters,
    filteredInvoices,
    handleFilterChange,
  };
};
