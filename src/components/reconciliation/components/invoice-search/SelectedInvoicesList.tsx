
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import { CurrencyBadge } from "../CurrencyBadge";

interface SelectedInvoicesListProps {
  selectedInvoices: any[];
  remainingAmount: number;
  selectedExpense?: any;
  onInvoiceSelect: (invoice: any) => void;
}

export function SelectedInvoicesList({ 
  selectedInvoices, 
  remainingAmount, 
  selectedExpense,
  onInvoiceSelect 
}: SelectedInvoicesListProps) {
  if (!selectedExpense || selectedInvoices.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-md p-2">
      <h4 className="font-medium mb-2">Facturas Seleccionadas:</h4>
      <ul className="space-y-1">
        {selectedInvoices.map(invoice => {
          const isCredit = invoice.invoice_type === 'E';
          const invoiceCurrency = invoice.currency || 'MXN';
          let displayAmount = invoice.total_amount;
          const finalAmount = isCredit ? -displayAmount : displayAmount;
          return (
            <li key={invoice.id} className="text-sm">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-medium">
                    {invoice.issuer_name} - {formatCardDate(invoice.invoice_date)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <CurrencyBadge 
                      currency={invoiceCurrency}
                      amount={invoice.total_amount}
                    />
                    {isCredit && (
                      <span className="text-red-600 text-xs font-medium">Nota de Crédito</span>
                    )}
                  </div>
                </div>
                <span className={`font-semibold ${isCredit ? 'text-red-600' : ''}`}>
                  {formatCurrency(finalAmount)} {invoiceCurrency}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 pt-2 border-t">
        <div className="flex justify-between items-center">
          <span className="font-medium">Restante:</span>
          <span className="font-medium">{formatCurrency(remainingAmount)} {selectedExpense.currency || 'MXN'}</span>
        </div>
        {Math.abs(remainingAmount) < 0.01 && (
          <div className="text-xs text-green-600 mt-1">
            Montos idénticos - conciliación exacta
          </div>
        )}
        {Math.abs(remainingAmount) >= 0.01 && (
          <div className="text-xs text-amber-600 mt-1">
            Se requiere un ajuste contable
          </div>
        )}
      </div>
    </div>
  );
}
