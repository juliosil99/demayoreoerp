
interface Totals {
  subtotal: number;
  commission: number;
  shipping: number;
  retention: number;
  total: number;
}

interface TotalsSummaryProps {
  totals: Totals;
}

export function TotalsSummary({ totals }: TotalsSummaryProps) {
  return (
    <div className="mt-4 p-4 bg-muted rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium">Subtotal: ${totals.subtotal.toFixed(2)}</p>
          <p className="text-sm font-medium">Comisiones: ${totals.commission.toFixed(2)}</p>
          <p className="text-sm font-medium">Envíos: ${totals.shipping.toFixed(2)}</p>
          <p className="text-sm font-medium">Retenciones: ${totals.retention.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">Total a Recibir: ${totals.total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
