
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const OptimizedInvoiceTableHeader = () => {
  return (
    <TableHeader className="bg-black text-white">
      <TableRow>
        <TableHead className="text-white">Fecha</TableHead>
        <TableHead className="text-white">No. Factura</TableHead>
        <TableHead className="text-white">Serie</TableHead>
        <TableHead className="text-white">Tipo</TableHead>
        <TableHead className="text-white">Emisor</TableHead>
        <TableHead className="text-white">Receptor</TableHead>
        <TableHead className="text-white text-right">Monto</TableHead>
        <TableHead className="text-white">Estado</TableHead>
        <TableHead className="text-white">Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};
