import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FileText, Check, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

export const InvoiceTable = ({ invoices }: { invoices: Invoice[] | null }) => {
  console.log("Received invoices data:", invoices);
  
  const getStatusIcon = (status: string | null) => {
    if (status === 'completed') return <Check className="h-4 w-4 text-green-500" />;
    if (status === 'error') return <X className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Invoice Number</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Issuer</TableHead>
          <TableHead>Receiver</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Tax</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices?.map((invoice) => {
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
              <TableCell>{invoice.invoice_type || "-"}</TableCell>
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
              <TableCell className="text-right">
                {invoice.total_amount
                  ? `${invoice.currency || "MXN"} ${invoice.total_amount.toFixed(2)}`
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                {invoice.tax_amount
                  ? `${invoice.currency || "MXN"} ${invoice.tax_amount.toFixed(2)}`
                  : "-"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(invoice.status)}
                  <span>{invoice.status}</span>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};