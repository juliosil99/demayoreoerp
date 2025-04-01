
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
  const [totalSelectedAmount, setTotalSelectedAmount] = useState<number>(0);
  const [calculatedRemaining, setCalculatedRemaining] = useState<number>(0);

  // Initialize temporary selections with current selections
  useEffect(() => {
    setTempSelectedInvoices(selectedInvoices);
    calculateTotals(selectedInvoices);
  }, [selectedInvoices, open]);

  // Calculate totals whenever temp selections change
  useEffect(() => {
    calculateTotals(tempSelectedInvoices);
  }, [tempSelectedInvoices]);

  const calculateTotals = (invoices: any[]) => {
    const total = invoices.reduce((sum, inv) => {
      const amountToAdd = inv.invoice_type === 'E' ? -inv.total_amount : inv.total_amount;
      return sum + (amountToAdd || 0);
    }, 0);
    
    setTotalSelectedAmount(total);
    setCalculatedRemaining(selectedExpense?.amount ? selectedExpense.amount - total : 0);
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buscar Factura para Conciliar</DialogTitle>
          <DialogDescription>
            Gasto: {selectedExpense.description} - {selectedExpense.amount}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <SelectedInvoicesList 
            selectedInvoices={selectedInvoices} 
            remainingAmount={remainingAmount} 
          />

          <SearchBar 
            searchTerm={searchTerm} 
            onSearchChange={onSearchChange} 
            onManualReconciliation={onManualReconciliation} 
          />

          {tempSelectedInvoices.length > 0 && (
            <InvoiceSelectionSummary 
              totalSelectedAmount={totalSelectedAmount}
              calculatedRemaining={calculatedRemaining}
              invoiceCount={tempSelectedInvoices.length}
            />
          )}

          <InvoiceList 
            filteredInvoices={filteredInvoices} 
            tempSelectedInvoices={tempSelectedInvoices} 
            toggleInvoiceSelection={toggleInvoiceSelection} 
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
