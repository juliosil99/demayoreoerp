
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";
import { SelectedInvoicesList } from "./SelectedInvoicesList";
import { InvoiceList } from "./InvoiceList";
import { InvoiceSelectionSummary } from "./InvoiceSelectionSummary";
import { PayrollInvoiceInfo } from "./PayrollInvoiceInfo";
import { useCurrencyCalculator } from "../../hooks/calculation/useCurrencyCalculator";
import { calculateExpenseSelection } from "../../hooks/calculation/calculateExpenseSelection";

interface InvoiceSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedExpense: any;
  remainingAmount: number;
  selectedInvoices: any[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filteredInvoices: any[];
  onInvoiceSelect: (invoices: any[]) => void;
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
  const [tempSelectedInvoices, setTempSelectedInvoices] = useState<any[]>([]);

  // Initialize temporary selections with current selections
  useEffect(() => {
    setTempSelectedInvoices(selectedInvoices);
  }, [selectedInvoices, open]);

  // Calculate payroll invoice statistics
  const payrollInvoices = filteredInvoices.filter(inv => inv.invoice_type === 'N');
  const totalPayrollAmount = payrollInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  // Calcular totales y restante usando SIEMPRE la moneda original del gasto
  const {
    totalSelectedAmount,
    remainingAmount: calcRemaining,
    currency,
  } = selectedExpense && tempSelectedInvoices.length > 0
    ? calculateExpenseSelection(selectedExpense, tempSelectedInvoices)
    : { totalSelectedAmount: 0, remainingAmount: selectedExpense?.currency === "USD" ? selectedExpense?.original_amount : selectedExpense?.amount, currency: selectedExpense?.currency || "MXN" };

  const toggleInvoiceSelection = (invoice: any) => {
    const isSelected = tempSelectedInvoices.some(inv => inv.id === invoice.id);
    if (isSelected) {
      setTempSelectedInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
    } else {
      setTempSelectedInvoices(prev => [...prev, invoice]);
    }
  };

  const handleConfirmSelection = () => {
    // Process all selected invoices at once
    if (tempSelectedInvoices.length > 0) {
      onInvoiceSelect(tempSelectedInvoices);
    }
  };

  if (!selectedExpense) return null;

  // Mostrar siempre el monto original en el header
  const originalAmount =
    selectedExpense.currency === "USD"
      ? selectedExpense.original_amount
      : selectedExpense.amount;
  const currencyCode = selectedExpense.currency || "MXN";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buscar Factura para Conciliar</DialogTitle>
          <DialogDescription>
            Gasto: {selectedExpense.description} – {originalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currencyCode}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <SelectedInvoicesList
            selectedInvoices={selectedInvoices}
            remainingAmount={remainingAmount}
            selectedExpense={selectedExpense}
          />

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            onManualReconciliation={onManualReconciliation}
          />

          <PayrollInvoiceInfo 
            payrollCount={payrollInvoices.length}
            totalPayrollAmount={totalPayrollAmount}
          />

          {tempSelectedInvoices.length > 0 && (
            <InvoiceSelectionSummary
              totalSelectedAmount={totalSelectedAmount}
              calculatedRemaining={calcRemaining}
              invoiceCount={tempSelectedInvoices.length}
              isConverted={false}
            />
          )}

          <InvoiceList
            filteredInvoices={filteredInvoices}
            tempSelectedInvoices={tempSelectedInvoices}
            toggleInvoiceSelection={toggleInvoiceSelection}
            selectedExpense={selectedExpense}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmSelection}
            disabled={tempSelectedInvoices.length === 0}
            className="ml-2"
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar Selección
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
