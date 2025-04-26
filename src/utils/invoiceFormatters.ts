
import type { Database } from "@/integrations/supabase/types";
import { formatCurrency } from "./formatters";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

/**
 * Formats the invoice amount considering the invoice type
 * Credit notes (type E) are shown as negative amounts
 */
export const formatInvoiceAmount = (invoice: Invoice): string => {
  if (!invoice.total_amount) return "-";
  
  // If it's a credit note (type E), show as negative amount
  const amount = invoice.invoice_type === 'E' 
    ? -1 * invoice.total_amount 
    : invoice.total_amount;
    
  return formatCurrency(amount);
};

/**
 * Formats the tax amount considering the invoice type
 * Credit notes (type E) are shown as negative amounts
 */
export const formatInvoiceTaxAmount = (invoice: Invoice): string => {
  if (!invoice.tax_amount) return "-";
  
  // If it's a credit note (type E), show as negative amount
  const amount = invoice.invoice_type === 'E' 
    ? -1 * invoice.tax_amount 
    : invoice.tax_amount;
    
  return formatCurrency(amount);
};

/**
 * Formats the invoice number with series if available
 */
export const formatInvoiceNumber = (invoice: Invoice): string => {
  return invoice.serie 
    ? `${invoice.serie}-${invoice.invoice_number}` 
    : invoice.invoice_number || "-";
};

/**
 * Returns the human-readable invoice type based on the code
 */
export const getInvoiceTypeLabel = (invoiceType: string | null): string => {
  switch(invoiceType) {
    case 'E': return 'Egreso (Nota de Crédito)';
    case 'I': return 'Ingreso';
    case 'P': return 'Pago';
    case 'N': return 'Nómina';
    default: return invoiceType || "-";
  }
};
