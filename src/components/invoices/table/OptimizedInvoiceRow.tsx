
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { FileText, Check, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { formatDate } from "@/utils/formatters";
import { 
  formatInvoiceAmount,
  formatInvoiceTaxAmount,
  formatInvoiceNumber
} from "@/utils/invoiceFormatters";
import { InvoiceTypeBadge } from "@/components/invoices/InvoiceTypeBadge";

type PartialInvoice = Partial<Database["public"]["Tables"]["invoices"]["Row"]>;

interface OptimizedInvoiceRowProps {
  invoice: PartialInvoice;
}

export const OptimizedInvoiceRow: React.FC<OptimizedInvoiceRowProps> = ({ invoice }) => {
  const getStatusIcon = (status: string | null | undefined) => {
    if (status === 'completed') return <Check className="h-4 w-4 text-green-500" />;
    if (status === 'error') return <X className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <TableRow key={invoice.id}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {invoice.filename || "-"}
        </div>
      </TableCell>
      <TableCell>
        {invoice.invoice_date 
          ? formatDate(invoice.invoice_date)
          : formatDate(invoice.created_at || "")}
      </TableCell>
      <TableCell>
        {formatInvoiceNumber(invoice as any)}
      </TableCell>
      <TableCell>
        <InvoiceTypeBadge invoiceType={invoice.invoice_type} />
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
        {formatInvoiceAmount(invoice as any)}
      </TableCell>
      <TableCell className={`text-right ${invoice.invoice_type === 'E' ? 'text-red-600 font-medium' : ''}`}>
        {formatInvoiceTaxAmount(invoice as any)}
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
