
import { formatCurrency } from "@/utils/formatters";

interface InvoiceSelectionSummaryProps {
  totalSelectedAmount: number;
  calculatedRemaining: number;
  invoiceCount: number;
}

export function InvoiceSelectionSummary({ 
  totalSelectedAmount, 
  calculatedRemaining, 
  invoiceCount 
}: InvoiceSelectionSummaryProps) {
  return (
    <div className="bg-muted/50 p-3 rounded-md flex justify-between items-center">
      <div>
        <p className="text-sm font-medium">Facturas seleccionadas: {invoiceCount}</p>
        <p className="text-sm">Total: {formatCurrency(totalSelectedAmount)}</p>
      </div>
      <div>
        <p className={`text-sm font-medium ${calculatedRemaining !== 0 ? 'text-amber-600' : 'text-green-600'}`}>
          {calculatedRemaining === 0 
            ? 'Montos coinciden exactamente' 
            : `Restante: ${formatCurrency(calculatedRemaining)}`}
        </p>
        <p className="text-xs text-muted-foreground">
          {calculatedRemaining !== 0 ? 'Se creará un ajuste contable' : ''}
        </p>
      </div>
    </div>
  );
}
