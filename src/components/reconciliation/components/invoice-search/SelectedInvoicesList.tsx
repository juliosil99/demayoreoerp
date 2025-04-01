
import { formatCurrency, formatCardDate } from "@/utils/formatters";

interface SelectedInvoicesListProps {
  selectedInvoices: any[];
  remainingAmount: number;
}

export function SelectedInvoicesList({ selectedInvoices, remainingAmount }: SelectedInvoicesListProps) {
  if (selectedInvoices.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-md p-2">
      <h4 className="font-medium mb-2">Facturas Seleccionadas:</h4>
      <ul className="space-y-1">
        {selectedInvoices.map(invoice => {
          const isCredit = invoice.invoice_type === 'E';
          const displayAmount = isCredit ? -invoice.total_amount : invoice.total_amount;
          
          return (
            <li key={invoice.id} className="text-sm flex justify-between">
              <span>
                {invoice.issuer_name} - {formatCardDate(invoice.invoice_date)}
                {isCredit && <span className="ml-2 text-red-600">(Nota de Crédito)</span>}
              </span>
              <span className={`font-semibold ${isCredit ? 'text-red-600' : ''}`}>
                {formatCurrency(displayAmount)}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 text-right font-medium">
        Restante: {formatCurrency(remainingAmount)}
      </div>
    </div>
  );
}
