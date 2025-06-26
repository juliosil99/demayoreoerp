
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./SearchBar";
import { InvoiceList } from "./InvoiceList";
import { InvoiceSelectionSummary } from "./InvoiceSelectionSummary";
import { SelectedInvoicesList } from "./SelectedInvoicesList";
import { formatCurrency } from "@/utils/formatters";

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
  isLoadingInvoices?: boolean;
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
  isLoadingInvoices = false
}: InvoiceSearchDialogProps) {
  if (!selectedExpense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Buscar Factura para Conciliar</span>
            {isLoadingInvoices && (
              <span className="text-sm text-muted-foreground">Cargando facturas...</span>
            )}
          </DialogTitle>
          <div className="text-sm text-gray-600">
            Gasto: {selectedExpense.description} - {formatCurrency(selectedExpense.amount)}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
          
          {selectedInvoices.length > 0 && (
            <InvoiceSelectionSummary
              selectedExpense={selectedExpense}
              selectedInvoices={selectedInvoices}
              remainingAmount={remainingAmount}
            />
          )}

          <div className="flex-1 overflow-hidden">
            {selectedInvoices.length > 0 ? (
              <SelectedInvoicesList
                selectedInvoices={selectedInvoices}
                onInvoiceSelect={onInvoiceSelect}
              />
            ) : (
              <InvoiceList
                invoices={filteredInvoices}
                onInvoiceSelect={onInvoiceSelect}
                isLoading={isLoadingInvoices}
              />
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onManualReconciliation}
            >
              Conciliación Manual
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
