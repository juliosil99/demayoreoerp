
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const InvoiceTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Archivo</TableHead>
        <TableHead>Fecha</TableHead>
        <TableHead>Folio</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead>Emisor</TableHead>
        <TableHead>Receptor</TableHead>
        <TableHead className="text-right">Total</TableHead>
        <TableHead className="text-right">Impuestos</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead>Reconciliación</TableHead>
      </TableRow>
    </TableHeader>
  );
};
