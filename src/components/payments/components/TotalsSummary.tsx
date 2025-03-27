
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
        <span>${totals.subtotal.toFixed(2)}</span>
      </div>
      {totals.commissions > 0 && (
        <div className="flex justify-between items-center">
          <span>Comisiones:</span>
          <span>${totals.commissions.toFixed(2)}</span>
        </div>
      )}
      {totals.retentions > 0 && (
        <div className="flex justify-between items-center">
          <span>Retenciones:</span>
          <span>${totals.retentions.toFixed(2)}</span>
        </div>
      )}
      {totals.shipping > 0 && (
        <div className="flex justify-between items-center">
          <span>Envío:</span>
          <span>${totals.shipping.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between items-center pt-2 border-t font-bold">
        <span>Total:</span>
        <span>${totals.total.toFixed(2)}</span>
      </div>
    </div>
  );
}
