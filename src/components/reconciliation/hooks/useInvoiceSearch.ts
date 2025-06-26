
import { useState } from "react";

export const useInvoiceSearch = () => {
  const [showInvoiceSearch, setShowInvoiceSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filterInvoices = (invoices: any[], term: string) => {
    return invoices.filter((invoice) => {
      const searchLower = term.toLowerCase();
      const matchesIssuer = invoice.issuer_name?.toLowerCase().includes(searchLower);
      const matchesInvoiceNumber = invoice.invoice_number?.toLowerCase().includes(searchLower);
      
      // Check if search term is a number for amount filtering
      const searchAsNumber = parseFloat(term);
      const matchesAmount = !isNaN(searchAsNumber) && 
        (invoice.total_amount?.toString().includes(term) || 
         Math.abs(invoice.total_amount - searchAsNumber) < 0.01);
      
      return matchesIssuer || matchesInvoiceNumber || matchesAmount;
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
