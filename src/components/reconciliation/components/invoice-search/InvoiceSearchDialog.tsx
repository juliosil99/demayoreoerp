
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./SearchBar";
import { InvoiceList } from "./InvoiceList";
import { InvoiceSelectionSummary } from "./InvoiceSelectionSummary";
import { SelectedInvoicesList } from "./SelectedInvoicesList";
import { formatCurrency } from "@/utils/formatters";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";

interface InvoiceSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedExpense: any;
  remainingAmount: number;
  selectedInvoices: any[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filteredInvoices: any[];
  onInvoiceToggle: (invoice: any) => void;
  onManualReconciliation: () => void;
  onReconcileSelected: () => void;
  onClearSelection: () => void;
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
  onInvoiceToggle,
  onManualReconciliation,
  onReconcileSelected,
  onClearSelection,
  isLoadingInvoices = false
}: InvoiceSearchDialogProps) {
  const [showSelectedView, setShowSelectedView] = useState(false);

  if (!selectedExpense) return null;

  const hasSelectedInvoices = selectedInvoices.length > 0;
  const totalSelectedAmount = selectedInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const isExactMatch = Math.abs(remainingAmount) <= 0.01;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Buscar Facturas para Conciliar</span>
            {isLoadingInvoices && (
              <span className="text-sm text-muted-foreground">Cargando facturas...</span>
            )}
          </DialogTitle>
          <div className="text-sm text-gray-600">
            Gasto: {selectedExpense.description} - {formatCurrency(selectedExpense.amount)}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {!showSelectedView && <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />}
          
          {hasSelectedInvoices && (
            <InvoiceSelectionSummary
              selectedExpense={selectedExpense}
              selectedInvoices={selectedInvoices}
              remainingAmount={remainingAmount}
            />
          )}

          {hasSelectedInvoices && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={showSelectedView ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSelectedView(!showSelectedView)}
                className="flex items-center gap-2"
              >
                {showSelectedView ? <ArrowLeft className="h-4 w-4" /> : null}
                {showSelectedView ? "Buscar Más" : `Ver Seleccionadas (${selectedInvoices.length})`}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearSelection}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Limpiar Selección
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {showSelectedView && hasSelectedInvoices ? (
              <SelectedInvoicesList
                selectedInvoices={selectedInvoices}
                remainingAmount={remainingAmount}
                selectedExpense={selectedExpense}
                onInvoiceSelect={(invoices) => {
                  // Handle removing invoices from selection
                  if (invoices.length === 0) {
                    onClearSelection();
                  }
                }}
              />
            ) : (
              <InvoiceList
                invoices={filteredInvoices}
                selectedInvoices={selectedInvoices}
                onInvoiceToggle={onInvoiceToggle}
                isLoading={isLoadingInvoices}
              />
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onManualReconciliation}
              >
                Conciliación Manual
              </Button>
            </div>
            
            <div className="flex gap-2">
              {hasSelectedInvoices && (
                <Button
                  onClick={onReconcileSelected}
                  className={isExactMatch ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {isExactMatch ? "Reconciliar" : "Reconciliar con Ajuste"}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
