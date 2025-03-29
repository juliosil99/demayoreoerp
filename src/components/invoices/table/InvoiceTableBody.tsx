
import React from "react";
import { TableBody } from "@/components/ui/table";
import { InvoiceRow } from "./InvoiceRow";
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

interface InvoiceTableBodyProps {
  invoices: Invoice[] | null | undefined;
}

export const InvoiceTableBody: React.FC<InvoiceTableBodyProps> = ({ invoices }) => {
  return (
    <TableBody>
      {invoices?.map((invoice) => (
        <InvoiceRow key={invoice.id} invoice={invoice} />
      ))}
    </TableBody>
  );
};
