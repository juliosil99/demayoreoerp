
import { formatCurrency } from "@/utils/formatters";
import { Info } from "lucide-react";

interface InvoiceSelectionSummaryProps {
  totalSelectedAmount: number;
  calculatedRemaining: number;
  invoiceCount: number;
  isConverted?: boolean;
}

export function InvoiceSelectionSummary({ 
  totalSelectedAmount, 
  calculatedRemaining, 
  invoiceCount,
  isConverted = false
}: InvoiceSelectionSummaryProps) {
  return (
    <div className="bg-muted/50 p-3 rounded-md">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Facturas seleccionadas: {invoiceCount}</p>
          <p className="text-sm">Total: {formatCurrency(totalSelectedAmount)}</p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${Math.abs(calculatedRemaining) < 0.01 ? 'text-green-600' : 'text-amber-600'}`}>
            {Math.abs(calculatedRemaining) < 0.01
              ? 'Montos coinciden exactamente' 
              : `Restante: ${formatCurrency(calculatedRemaining)}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {Math.abs(calculatedRemaining) >= 0.01 ? 'Se creará un ajuste contable' : ''}
          </p>
        </div>
      </div>
      
      {isConverted && (
        <div className="mt-2 pt-2 border-t border-amber-200 bg-amber-50 p-2 rounded flex items-center gap-2">
          <Info className="h-4 w-4 text-amber-600" />
          <span className="text-xs text-amber-700">
            Los cálculos incluyen conversión automática de moneda a MXN
          </span>
        </div>
      )}
    </div>
  );
}
