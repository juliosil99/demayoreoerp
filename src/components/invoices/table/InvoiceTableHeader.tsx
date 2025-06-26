
import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export const InvoiceTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Archivo</TableHead>
        <TableHead>Fecha</TableHead>
        <TableHead>Folio</TableHead>
        <TableHead>Serie</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead>Emisor</TableHead>
        <TableHead>Receptor</TableHead>
        <TableHead className="text-right">Total</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead>Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};
