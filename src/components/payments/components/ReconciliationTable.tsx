
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Sale {
  id: number;
  date: string;
  orderNumber: string;
  price?: number;
  comission?: number;
  shipping?: number;
  retention?: number;
}

interface ReconciliationTableProps {
  sales: Sale[] | null;
  isLoading: boolean;
}

export function ReconciliationTable({ sales, isLoading }: ReconciliationTableProps) {
  return (
    <div className="max-h-[400px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>No. Orden</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Comisión</TableHead>
            <TableHead>Envío</TableHead>
            <TableHead>Retención</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">Cargando...</TableCell>
            </TableRow>
          ) : sales?.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{format(new Date(sale.date), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{sale.orderNumber}</TableCell>
              <TableCell>${sale.price?.toFixed(2)}</TableCell>
              <TableCell>${sale.comission?.toFixed(2)}</TableCell>
              <TableCell>${sale.shipping?.toFixed(2)}</TableCell>
              <TableCell>${sale.retention?.toFixed(2)}</TableCell>
              <TableCell>
                ${((sale.price || 0) - (sale.comission || 0) - (sale.shipping || 0) - (sale.retention || 0)).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
