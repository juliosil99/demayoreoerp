
import React from "react";
import { TableHead, TableRow } from "@/components/ui/table";

export const ProductTableHeader: React.FC = () => {
  return (
    <TableRow>
      <TableHead>Descripción</TableHead>
      <TableHead>Cantidad</TableHead>
      <TableHead>Precio Unitario</TableHead>
      <TableHead>Total</TableHead>
      <TableHead>No. Factura</TableHead>
      <TableHead>Fecha</TableHead>
      <TableHead>Emisor</TableHead>
      <TableHead className="text-right">Acciones</TableHead>
    </TableRow>
  );
};
