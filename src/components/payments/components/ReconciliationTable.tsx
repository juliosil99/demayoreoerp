
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { UnreconciledSale } from "../hooks/useBulkReconciliation";
import { formatCurrency } from "@/lib/utils";

interface ReconciliationTableProps {
  sales?: UnreconciledSale[];
  isLoading?: boolean;
}

export function ReconciliationTable({ sales = [], isLoading = false }: ReconciliationTableProps) {
  const renderContent = () => {
    if (isLoading) {
      return Array(5).fill(0).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        </TableRow>
      ));
    }

    if (sales.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            <div className="flex flex-col items-center justify-center py-4">
              <p className="text-muted-foreground text-sm">No se encontraron ventas que coincidan con los filtros actuales</p>
              <p className="text-xs text-muted-foreground mt-1">Intenta cambiar los filtros o cargar un archivo con números de orden diferentes</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return sales.map((sale) => (
      <TableRow key={sale.id}>
        <TableCell>{sale.orderNumber || '-'}</TableCell>
        <TableCell>{sale.date ? new Date(sale.date).toLocaleDateString() : '-'}</TableCell>
        <TableCell>{sale.Channel || '-'}</TableCell>
        <TableCell>{sale.productName || '-'}</TableCell>
        <TableCell className="text-right">
          {sale.price !== null ? formatCurrency(sale.price) : '-'}
        </TableCell>
      </TableRow>
    ));
  };

  const calculateTotal = () => {
    if (!sales?.length) return 0;
    return sales.reduce((acc, sale) => acc + (sale.price || 0), 0);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número de Orden</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Canal</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderContent()}
        </TableBody>
      </Table>
      
      {sales.length > 0 && (
        <div className="flex justify-end p-4 border-t">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Total:</span>
            <span className="text-lg font-semibold">{formatCurrency(calculateTotal())}</span>
            <span className="text-sm text-muted-foreground">({sales.length} órdenes)</span>
          </div>
        </div>
      )}
    </div>
  );
}
