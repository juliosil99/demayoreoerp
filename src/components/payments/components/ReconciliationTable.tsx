
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCardDate } from "@/utils/formatters";

interface Sale {
  id: number;
  date: string;
  Channel: string;
  orderNumber: string;
  price: number;
  productName: string;
  type?: string; // Added type field to identify credit notes
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
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => {
            // Format the price based on whether it's a credit note
            const isCredit = sale.type === 'E';
            const formattedPrice = isCredit 
              ? `-$${Math.abs(sale.price).toFixed(2)}` 
              : `$${sale.price?.toFixed(2) || "0.00"}`;
              
            return (
              <TableRow key={sale.id}>
                <TableCell>
                  {sale.date ? formatCardDate(sale.date) : "-"}
                </TableCell>
                <TableCell>{sale.orderNumber || "-"}</TableCell>
                <TableCell>{sale.Channel || "-"}</TableCell>
                <TableCell>{sale.productName || "-"}</TableCell>
                <TableCell>
                  {isCredit ? 'Nota de Crédito' : 'Factura'}
                </TableCell>
                <TableCell className={`text-right ${isCredit ? 'text-red-600 font-medium' : ''}`}>
                  {formattedPrice}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
