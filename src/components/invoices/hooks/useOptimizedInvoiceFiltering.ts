
import { useState, useCallback } from "react";

export interface InvoiceFilters {
  search: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  invoiceType: string;
  minAmount: string;
  maxAmount: string;
  reconciliationStatus: string;
  issuerName: string;
  receiverName: string;
}

export const useOptimizedInvoiceFiltering = () => {
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: "",
    dateFrom: undefined,
    dateTo: undefined,
    invoiceType: "",
    minAmount: "",
    maxAmount: "",
    reconciliationStatus: "all",
    issuerName: "",
    receiverName: "",
  });

  const handleFilterChange = useCallback((newFilters: InvoiceFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      dateFrom: undefined,
      dateTo: undefined,
      invoiceType: "",
      minAmount: "",
      maxAmount: "",
      reconciliationStatus: "all",
      issuerName: "",
      receiverName: "",
    });
  }, []);

  return {
    filters,
    handleFilterChange,
    clearFilters,
  };
};
