
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import { CurrencyBadge } from "../CurrencyBadge";
import { useCurrencyCalculator } from "../../hooks/calculation/useCurrencyCalculator";

interface SelectedInvoicesListProps {
  selectedInvoices: any[];
  remainingAmount: number;
  selectedExpense?: any;
}

export function SelectedInvoicesList({ selectedInvoices, remainingAmount, selectedExpense }: SelectedInvoicesListProps) {
  const { getDisplayAmounts, calculateRemainingWithCurrency } = useCurrencyCalculator();
  
  if (selectedInvoices.length === 0) {
    return null;
  }

  const { isConverted } = selectedExpense 
    ? calculateRemainingWithCurrency(selectedExpense, selectedInvoices)
    : { isConverted: false };

  return (
    <div className="border rounded-md p-2">
      <h4 className="font-medium mb-2">Facturas Seleccionadas:</h4>
      <ul className="space-y-1">
        {selectedInvoices.map(invoice => {
          const isCredit = invoice.invoice_type === 'E';
          const invoiceCurrency = invoice.currency || 'MXN';
          
          // Get display amounts if we have expense context
          let displayAmount = invoice.total_amount;
          let showConversion = false;
          
          if (selectedExpense) {
            const { invoice: invoiceDisplay } = getDisplayAmounts(selectedExpense, invoice);
            if (invoiceDisplay.converted) {
              displayAmount = invoiceDisplay.converted.amount;
              showConversion = true;
            }
          }
          
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
                      convertedAmount={showConversion ? displayAmount : undefined}
                      convertedCurrency={showConversion ? 'MXN' : undefined}
                      exchangeRate={invoice.exchange_rate}
                      showConversion={showConversion}
                    />
                    {isCredit && (
                      <span className="text-red-600 text-xs font-medium">Nota de Crédito</span>
                    )}
                  </div>
                </div>
                <span className={`font-semibold ${isCredit ? 'text-red-600' : ''}`}>
                  {formatCurrency(finalAmount)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 pt-2 border-t">
        <div className="flex justify-between items-center">
          <span className="font-medium">Restante:</span>
          <span className="font-medium">{formatCurrency(remainingAmount)}</span>
        </div>
        {isConverted && (
          <div className="text-xs text-amber-600 mt-1">
            * Cálculos incluyen conversión de moneda
          </div>
        )}
      </div>
    </div>
  );
}
