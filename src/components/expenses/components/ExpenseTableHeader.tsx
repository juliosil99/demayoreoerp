
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ExpenseTableHeader() {
  return (
    <TableHeader className="bg-black text-white">
      <TableRow>
        <TableHead className="w-[110px]">Fecha</TableHead>
        <TableHead>Descripción</TableHead>
        <TableHead className="text-right w-[110px]">Monto</TableHead>
        <TableHead className="w-[130px]">Cuenta Bancaria</TableHead>
        <TableHead className="w-[180px]">Cuenta de Gasto</TableHead>
        <TableHead className="w-[180px]">Proveedor</TableHead>
        <TableHead className="w-[120px]">Método de Pago</TableHead>
        <TableHead className="w-[120px]">Referencia</TableHead>
        <TableHead className="w-[120px]">Conciliación</TableHead>
        <TableHead className="w-[80px]">Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
}
