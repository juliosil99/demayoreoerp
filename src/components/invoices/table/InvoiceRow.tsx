
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { FileText, Check, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

interface InvoiceRowProps {
  invoice: Invoice;
}

export const InvoiceRow: React.FC<InvoiceRowProps> = ({ invoice }) => {
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
};
