import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FileX } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database["public"]["Tables"]["Invoices"]["Row"];

export const InvoiceTable = ({ invoices }: { invoices: Invoice[] | null }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>File Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Invoice Number</TableHead>
          <TableHead>Issuer</TableHead>
          <TableHead>Receiver</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices?.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <FileX className="h-4 w-4" />
                {invoice.filename}
              </div>
            </TableCell>
            <TableCell>
              {new Date(invoice.created_at || "").toLocaleDateString()}
            </TableCell>
            <TableCell>{invoice.invoice_number || "-"}</TableCell>
            <TableCell>{invoice.issuer_name || "-"}</TableCell>
            <TableCell>{invoice.receiver_name || "-"}</TableCell>
            <TableCell>
              {invoice.total_amount
                ? `${invoice.currency || "MXN"} ${invoice.total_amount.toFixed(2)}`
                : "-"}
            </TableCell>
            <TableCell>{invoice.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};