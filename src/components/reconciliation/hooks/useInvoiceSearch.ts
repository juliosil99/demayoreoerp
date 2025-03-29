
import { useState } from "react";

export const useInvoiceSearch = () => {
  const [showInvoiceSearch, setShowInvoiceSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filterInvoices = (invoices: any[], term: string) => {
    return invoices.filter((invoice) => {
      const searchLower = term.toLowerCase();
      const matchesIssuer = invoice.issuer_name?.toLowerCase().includes(searchLower);
      const matchesAmount = invoice.total_amount?.toString().includes(term);
      return matchesIssuer || matchesAmount;
    });
  };

  return {
    showInvoiceSearch,
    setShowInvoiceSearch,
    searchTerm,
    setSearchTerm,
    filterInvoices,
  };
};
