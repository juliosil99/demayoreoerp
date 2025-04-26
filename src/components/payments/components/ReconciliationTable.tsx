
import { Skeleton } from "@/components/ui/skeleton";
import { UnreconciledSale } from "../hooks/useBulkReconciliation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Download } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface ReconciliationTableProps {
  sales?: UnreconciledSale[];
  isLoading: boolean;
}

export function ReconciliationTable({ sales, isLoading }: ReconciliationTableProps) {
  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!sales || sales.length === 0) {
    return (
      <Alert variant="default" className="bg-muted/50">
        <Info className="h-4 w-4" />
        <AlertDescription>
          No hay ventas sin reconciliar que coincidan con los filtros.
        </AlertDescription>
      </Alert>
    );
  }

  // Calculate totals and summaries
  const totalSales = sales.length;
  const totalAmount = sales.reduce((sum, sale) => sum + (sale.price || 0), 0);
  const totalCommissions = sales.reduce((sum, sale) => sum + (sale.commission || 0), 0);
  const totalShipping = sales.reduce((sum, sale) => sum + (sale.shippingCost || 0), 0);
  const netAmount = totalAmount - totalCommissions - totalShipping;
  
  // Count invoices and credit notes
  const invoices = sales.filter(sale => !sale.type || sale.type === 'invoice').length;
  const creditNotes = sales.filter(sale => sale.type === 'credit_note').length;

  const handleDownloadSummary = () => {
    // TODO: Implement download functionality
    console.log("Download summary clicked");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Resumen de Reconciliación</h3>
        <Button variant="outline" onClick={handleDownloadSummary}>
          <Download className="h-4 w-4 mr-2" />
          Descargar Detalle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-md bg-background">
          <div className="text-sm text-muted-foreground">Documentos a Reconciliar</div>
          <div className="text-2xl font-bold">{totalSales}</div>
          <div className="text-sm text-muted-foreground mt-2">
            {invoices} facturas / {creditNotes} notas de crédito
          </div>
        </div>
        <div className="p-4 border rounded-md bg-background">
          <div className="text-sm text-muted-foreground">Monto Bruto</div>
          <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          <div className="text-sm text-muted-foreground mt-2">
            Antes de comisiones y envíos
          </div>
        </div>
        <div className="p-4 border rounded-md bg-background">
          <div className="text-sm text-muted-foreground">Monto Neto</div>
          <div className="text-2xl font-bold">{formatCurrency(netAmount)}</div>
          <div className="text-sm text-muted-foreground mt-2">
            Después de {formatCurrency(totalCommissions)} en comisiones
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Comisión</TableHead>
              <TableHead className="text-right">Envío</TableHead>
              <TableHead className="text-right">Neto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.slice(0, 10).map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.date}</TableCell>
                <TableCell>{sale.orderNumber}</TableCell>
                <TableCell>{sale.Channel}</TableCell>
                <TableCell className="text-right">{formatCurrency(sale.price)}</TableCell>
                <TableCell className="text-right">{formatCurrency(sale.commission)}</TableCell>
                <TableCell className="text-right">{formatCurrency(sale.shippingCost)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency((sale.price || 0) - (sale.commission || 0) - (sale.shippingCost || 0))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
