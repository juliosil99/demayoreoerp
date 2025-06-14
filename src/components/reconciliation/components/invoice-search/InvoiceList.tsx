
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import { InvoiceTypeBadge } from "@/components/invoices/InvoiceTypeBadge";

interface InvoiceListProps {
  filteredInvoices: any[];
  tempSelectedInvoices: any[];
  toggleInvoiceSelection: (invoice: any) => void;
}

export function InvoiceList({ 
  filteredInvoices, 
  tempSelectedInvoices, 
  toggleInvoiceSelection 
}: InvoiceListProps) {
  return (
    <div className="border rounded-md divide-y">
      {filteredInvoices.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          No se encontraron facturas que coincidan con la búsqueda
        </div>
      ) : (
        filteredInvoices.map(invoice => {
          const isCredit = invoice.invoice_type === 'E';
          const displayAmount = isCredit ? -invoice.total_amount : invoice.total_amount;
          const isSelected = tempSelectedInvoices.some(inv => inv.id === invoice.id);
          
          return (
            <div
              key={invoice.id}
              className={`p-3 hover:bg-muted/50 cursor-pointer flex justify-between items-center ${isSelected ? 'bg-primary/10' : ''}`}
              onClick={() => toggleInvoiceSelection(invoice)}
            >
              <div className="flex items-center space-x-3">
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={() => toggleInvoiceSelection(invoice)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{invoice.issuer_name}</span>
                    <InvoiceTypeBadge invoiceType={invoice.invoice_type} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCardDate(invoice.invoice_date)} - {invoice.invoice_number || invoice.uuid}
                  </div>
                </div>
              </div>
              <div className={`font-semibold ${isCredit ? 'text-red-600' : ''}`}>
                {formatCurrency(displayAmount)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
