
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import { Search, FileText, RefreshCw, Check } from "lucide-react";
import { useState, useEffect } from "react";

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
    // Process each selected invoice in sequence
    if (tempSelectedInvoices.length > 0) {
      const firstInvoice = tempSelectedInvoices[0];
      onInvoiceSelect(firstInvoice);
    }
  };

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

          {tempSelectedInvoices.length > 0 && (
            <div className="bg-muted/50 p-3 rounded-md flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Facturas seleccionadas: {tempSelectedInvoices.length}</p>
                <p className="text-sm">Total: {formatCurrency(totalSelectedAmount)}</p>
              </div>
              <div>
                <p className={`text-sm font-medium ${calculatedRemaining !== 0 ? 'text-amber-600' : 'text-green-600'}`}>
                  {calculatedRemaining === 0 
                    ? 'Montos coinciden exactamente' 
                    : `Restante: ${formatCurrency(calculatedRemaining)}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {calculatedRemaining !== 0 ? 'Se creará un ajuste contable' : ''}
                </p>
              </div>
            </div>
          )}

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
                      <div>
                        <div className="font-medium">
                          {invoice.issuer_name}
                          {isCredit && <span className="ml-2 text-red-600">(Nota de Crédito)</span>}
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
