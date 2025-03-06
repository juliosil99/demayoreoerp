
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ExpenseTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Fecha</TableHead>
        <TableHead>Descripción</TableHead>
        <TableHead>Monto</TableHead>
        <TableHead>Cuenta Bancaria</TableHead>
        <TableHead>Cuenta de Gasto</TableHead>
        <TableHead>Proveedor</TableHead>
        <TableHead>Método de Pago</TableHead>
        <TableHead>Referencia</TableHead>
        <TableHead>Factura</TableHead>
        <TableHead>Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
}
