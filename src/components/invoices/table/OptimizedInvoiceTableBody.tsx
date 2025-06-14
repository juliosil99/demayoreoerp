
import React from "react";
import { TableBody } from "@/components/ui/table";
import { OptimizedInvoiceRow } from "./OptimizedInvoiceRow";
import type { Database } from "@/integrations/supabase/types";

type PartialInvoice = Partial<Database["public"]["Tables"]["invoices"]["Row"]>;

interface OptimizedInvoiceTableBodyProps {
  invoices: PartialInvoice[];
}

export const OptimizedInvoiceTableBody: React.FC<OptimizedInvoiceTableBodyProps> = ({ invoices }) => {
  return (
    <TableBody>
      {invoices.map((invoice) => (
        <OptimizedInvoiceRow key={invoice.id} invoice={invoice} />
      ))}
    </TableBody>
  );
};
