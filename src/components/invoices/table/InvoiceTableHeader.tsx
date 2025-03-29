
import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export const InvoiceTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Nombre del Archivo</TableHead>
        <TableHead>Fecha</TableHead>
        <TableHead>Número de Factura</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead>Emisor</TableHead>
        <TableHead>Receptor</TableHead>
        <TableHead className="text-right">Monto</TableHead>
        <TableHead className="text-right">Impuesto</TableHead>
        <TableHead>Estado</TableHead>
      </TableRow>
    </TableHeader>
  );
};
