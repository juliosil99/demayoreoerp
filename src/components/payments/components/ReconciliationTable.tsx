
import { Skeleton } from "@/components/ui/skeleton";
import { UnreconciledSale } from "../hooks/useBulkReconciliation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

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

  // Calculate totals
  const totalSales = sales.length;
  const totalAmount = sales.reduce((sum, sale) => sum + (sale.price || 0), 0);
  
  // Count number of invoices and credit notes
  const invoices = sales.filter(sale => !sale.type || sale.type === 'invoice').length;
  const creditNotes = sales.filter(sale => sale.type === 'credit_note').length;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Resumen de Reconciliación</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-md bg-background">
          <div className="text-sm text-muted-foreground">Total de Facturas</div>
          <div className="text-2xl font-bold">{invoices}</div>
        </div>
        <div className="p-4 border rounded-md bg-background">
          <div className="text-sm text-muted-foreground">Notas de Crédito</div>
          <div className="text-2xl font-bold">{creditNotes}</div>
        </div>
        <div className="p-4 border rounded-md bg-background">
          <div className="text-sm text-muted-foreground">Monto Total</div>
          <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
