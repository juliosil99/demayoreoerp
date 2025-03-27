
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface Sale {
  id: number;
  date: string;
  Channel: string;
  orderNumber: string;
  price: number;
  productName: string;
}

interface ReconciliationTableProps {
  sales?: Sale[];
  isLoading: boolean;
}

export function ReconciliationTable({ sales, isLoading }: ReconciliationTableProps) {
  if (isLoading) {
    return <div className="text-center py-4">Cargando ventas...</div>;
  }

  if (!sales?.length) {
    return (
      <div className="text-center py-4 border rounded-md">
        No hay ventas sin reconciliar que coincidan con los filtros.
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Orden</TableHead>
            <TableHead>Canal</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>
                {sale.date ? format(new Date(sale.date), "dd/MM/yyyy") : "-"}
              </TableCell>
              <TableCell>{sale.orderNumber || "-"}</TableCell>
              <TableCell>{sale.Channel || "-"}</TableCell>
              <TableCell>{sale.productName || "-"}</TableCell>
              <TableCell className="text-right">${sale.price?.toFixed(2) || "0.00"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
