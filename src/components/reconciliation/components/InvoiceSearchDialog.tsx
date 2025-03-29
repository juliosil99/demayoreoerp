
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import { Search, FileText, RefreshCw } from "lucide-react";

interface InvoiceSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedExpense: any;
  remainingAmount: number;
  selectedInvoices: any[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filteredInvoices: any[];
  onInvoiceSelect: (invoice: any) => void;
  onManualReconciliation: () => void;
}

export function InvoiceSearchDialog({
  open,
  onOpenChange,
  selectedExpense,
  remainingAmount,
  selectedInvoices,
  searchTerm,
  onSearchChange,
  filteredInvoices,
  onInvoiceSelect,
  onManualReconciliation,
}: InvoiceSearchDialogProps) {
  if (!selectedExpense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buscar Factura para Conciliar</DialogTitle>
          <DialogDescription>
            Gasto: {selectedExpense.description} - {formatCurrency(selectedExpense.amount)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {selectedInvoices.length > 0 && (
            <div className="border rounded-md p-2">
              <h4 className="font-medium mb-2">Facturas Seleccionadas:</h4>
              <ul className="space-y-1">
                {selectedInvoices.map(invoice => (
                  <li key={invoice.id} className="text-sm flex justify-between">
                    <span>
                      {invoice.issuer_name} - {formatCardDate(invoice.invoice_date)}
                    </span>
                    <span className="font-semibold">{formatCurrency(invoice.total_amount)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-right font-medium">
                Restante: {formatCurrency(remainingAmount)}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por emisor o monto..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" onClick={onManualReconciliation} className="whitespace-nowrap">
              <FileText className="h-4 w-4 mr-2" />
              Reconciliación Manual
            </Button>
          </div>

          <div className="border rounded-md divide-y">
            {filteredInvoices.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No se encontraron facturas que coincidan con la búsqueda
              </div>
            ) : (
              filteredInvoices.map(invoice => (
                <div
                  key={invoice.id}
                  className="p-3 hover:bg-muted/50 cursor-pointer flex justify-between items-center"
                  onClick={() => onInvoiceSelect(invoice)}
                >
                  <div>
                    <div className="font-medium">{invoice.issuer_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCardDate(invoice.invoice_date)} - {invoice.invoice_number || invoice.uuid}
                    </div>
                  </div>
                  <div className="font-semibold">{formatCurrency(invoice.total_amount)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
