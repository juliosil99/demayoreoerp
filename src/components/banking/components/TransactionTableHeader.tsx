
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TransactionTableHeader() {
  return (
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead>Fecha</TableHead>
        <TableHead>Descripción</TableHead>
        <TableHead>Referencia</TableHead>
        <TableHead className="text-right">Tipo</TableHead>
        <TableHead className="text-right">Monto</TableHead>
        <TableHead className="text-right font-medium">Saldo</TableHead>
      </TableRow>
    </TableHeader>
  );
}
