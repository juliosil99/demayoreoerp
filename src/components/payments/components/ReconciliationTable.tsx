
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate, formatCurrency } from "@/utils/formatters";
import type { UnreconciledSale } from "../types/UnreconciledSale";

interface ReconciliationTableProps {
  sales: UnreconciledSale[];
  isLoading: boolean;
  selectedSales: number[];
  onSelectSale: (id: number) => void;
}

export function ReconciliationTable({
  sales,
  isLoading,
  selectedSales,
  onSelectSale
}: ReconciliationTableProps) {
  if (isLoading) {
    return <div className="my-4 text-center">Cargando ventas sin reconciliar...</div>;
  }

  if (!sales || sales.length === 0) {
    return <div className="my-4 text-center">No se encontraron ventas sin reconciliar con los filtros aplicados.</div>;
  }

  return (
    <div className="my-4 border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={sales.length > 0 && selectedSales.length === sales.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelectSale(sales.map(sale => sale.id) as unknown as number);
                  } else {
                    onSelectSale([] as unknown as number);
                  }
                }}
              />
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Canal</TableHead>
            <TableHead>No. Orden</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id} className="hover:bg-muted/30">
              <TableCell>
                <Checkbox
                  checked={selectedSales.includes(sale.id)}
                  onCheckedChange={() => onSelectSale(sale.id)}
                />
              </TableCell>
              <TableCell>{sale.id}</TableCell>
              <TableCell>{formatDate(sale.date || "")}</TableCell>
              <TableCell>{sale.Channel}</TableCell>
              <TableCell>{sale.orderNumber}</TableCell>
              <TableCell>{sale.productName}</TableCell>
              <TableCell className="text-right">{formatCurrency(sale.price || 0)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
