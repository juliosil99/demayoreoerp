
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export function ExpenseTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[110px]">Fecha</TableHead>
        <TableHead>Descripción</TableHead>
        <TableHead className="text-right">Monto</TableHead>
        <TableHead>Cuenta Bancaria</TableHead>
        <TableHead>Cuenta de Gasto</TableHead>
        <TableHead>Proveedor</TableHead>
        <TableHead>Método de Pago</TableHead>
        <TableHead>Referencia</TableHead>
        <TableHead>Factura</TableHead>
        <TableHead className="w-[80px]"></TableHead>
      </TableRow>
    </TableHeader>
  );
}
