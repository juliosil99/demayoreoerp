
import { formatCurrency } from "@/utils/formatters";

interface TotalsProps {
  subtotal: number;
  commissions: number;
  retentions: number;
  shipping: number;
  total: number;
}

interface TotalsSummaryProps {
  totals: TotalsProps;
}

export function TotalsSummary({ totals }: TotalsSummaryProps) {
  return (
    <div className="space-y-1 border rounded-md p-4 bg-muted/20">
      <div className="flex justify-between items-center">
        <span className="font-medium">Subtotal:</span>
        <span>{formatCurrency(totals.subtotal)}</span>
      </div>
      {totals.commissions > 0 && (
        <div className="flex justify-between items-center">
          <span>Comisiones:</span>
          <span>{formatCurrency(totals.commissions)}</span>
        </div>
      )}
      {totals.retentions > 0 && (
        <div className="flex justify-between items-center">
          <span>Retenciones:</span>
          <span>{formatCurrency(totals.retentions)}</span>
        </div>
      )}
      {totals.shipping > 0 && (
        <div className="flex justify-between items-center">
          <span>Envío:</span>
          <span>{formatCurrency(totals.shipping)}</span>
        </div>
      )}
      <div className="flex justify-between items-center pt-2 border-t font-bold">
        <span>Total:</span>
        <span>{formatCurrency(totals.total)}</span>
      </div>
    </div>
  );
}
