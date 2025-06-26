
import { formatCurrency } from "@/utils/formatters";
import { Info } from "lucide-react";

interface InvoiceSelectionSummaryProps {
  selectedExpense: any;
  selectedInvoices: any[];
  remainingAmount: number;
}

export function InvoiceSelectionSummary({ 
  selectedExpense,
  selectedInvoices, 
  remainingAmount
}: InvoiceSelectionSummaryProps) {
  const totalSelectedAmount = selectedInvoices.reduce((sum, invoice) => {
    const isCredit = invoice.invoice_type === 'E';
    const amount = isCredit ? -invoice.total_amount : invoice.total_amount;
    return sum + amount;
  }, 0);

  return (
    <div className="bg-muted/50 p-3 rounded-md">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Facturas seleccionadas: {selectedInvoices.length}</p>
          <p className="text-sm">Total: {formatCurrency(totalSelectedAmount)}</p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${Math.abs(remainingAmount) < 0.01 ? 'text-green-600' : 'text-amber-600'}`}>
            {Math.abs(remainingAmount) < 0.01
              ? 'Montos coinciden exactamente' 
              : `Restante: ${formatCurrency(remainingAmount)}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {Math.abs(remainingAmount) >= 0.01 ? 'Se creará un ajuste contable' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
