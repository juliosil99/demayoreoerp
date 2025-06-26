

import { useOptimizedInvoices } from "../../hooks/useOptimizedInvoices";
import { useInvoiceSearch } from "../../hooks/useInvoiceSearch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import { SearchBar } from "../invoice-search/SearchBar";

interface InvoiceSelectorProps {
  onAddItem: (item: any) => void;
  selectedItems: any[];
}

export function InvoiceSelector({ onAddItem, selectedItems }: InvoiceSelectorProps) {
  const { data: invoices, isLoading } = useOptimizedInvoices();
  const { searchTerm, setSearchTerm, filterInvoices } = useInvoiceSearch();

  // Filter out all types of reconciled invoices
  const availableInvoices = invoices?.filter(invoice => {
    // Exclude invoices that have been reconciled by any method
    const isReconciledByBatch = !!invoice.reconciliation_batch_id;
    const isManuallyReconciled = invoice.manually_reconciled === true;
    const isProcessed = invoice.processed === true;
    
    // For payroll invoices (type N), we might want to include them even if processed
    // based on the existing logic in useOptimizedInvoices
    const isPayrollInvoice = invoice.invoice_type === 'N';
    
    // Exclude if reconciled by any method, except for payroll which follows special rules
    if (isPayrollInvoice) {
      // For payroll, only exclude if reconciled by batch or manually reconciled
      return !isReconciledByBatch && !isManuallyReconciled;
    } else {
      // For regular invoices, exclude if reconciled by any method
      return !isReconciledByBatch && !isManuallyReconciled && !isProcessed;
    }
  }) || [];

  // Apply search filter
  const filteredInvoices = filterInvoices(availableInvoices, searchTerm);

  // Logging for debugging
  console.log("🔍 InvoiceSelector Debug:", {
    totalInvoices: invoices?.length || 0,
    availableAfterFilter: availableInvoices.length,
    filteredBySearch: filteredInvoices.length,
    searchTerm,
    payrollInvoices: invoices?.filter(inv => inv.invoice_type === 'N').length || 0,
    reconciledByBatch: invoices?.filter(inv => !!inv.reconciliation_batch_id).length || 0,
    manuallyReconciled: invoices?.filter(inv => inv.manually_reconciled === true).length || 0,
    processed: invoices?.filter(inv => inv.processed === true).length || 0
  });

  const isSelected = (invoiceId: string) => {
    return selectedItems.some(item => item.id === invoiceId && item.type === 'invoice');
  };

  const handleAddInvoice = (invoice: any) => {
    const isCredit = invoice.invoice_type === 'E';
    const amount = isCredit ? -invoice.total_amount : invoice.total_amount;
    
    const item = {
      id: invoice.id.toString(),
      type: 'invoice' as const,
      description: `${invoice.issuer_name} - ${invoice.invoice_number || 'Sin número'}`,
      amount: amount,
      currency: invoice.currency || 'MXN',
      date: invoice.invoice_date,
      supplier: invoice.issuer_name
    };
    onAddItem(item);
  };

  if (isLoading) {
    return <div className="p-4 text-center">Cargando facturas...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Lista de facturas */}
      <ScrollArea className="h-80">
        <div className="space-y-2">
          {filteredInvoices.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              {searchTerm ? 'No se encontraron facturas que coincidan con la búsqueda' : 'No se encontraron facturas disponibles para reconciliar'}
            </div>
          ) : (
            filteredInvoices.map((invoice) => {
              const selected = isSelected(invoice.id.toString());
              const isCredit = invoice.invoice_type === 'E';
              const isPayroll = invoice.invoice_type === 'N';
              
              return (
                <Card key={invoice.id} className={`cursor-pointer transition-colors ${selected ? 'bg-muted' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm">
                            {invoice.issuer_name}
                          </h4>
                          {isCredit && (
                            <Badge variant="destructive" className="text-xs">
                              Nota de Crédito
                            </Badge>
                          )}
                          {isPayroll && (
                            <Badge variant="secondary" className="text-xs">
                              Nómina
                            </Badge>
                          )}
                          {invoice.currency && invoice.currency !== 'MXN' && (
                            <Badge variant="outline" className="text-xs">
                              {invoice.currency}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>Fecha: {formatCardDate(invoice.invoice_date)}</div>
                          <div>Factura: {invoice.invoice_number || 'Sin número'}</div>
                          {isPayroll && (
                            <div className="text-blue-600">Emitida por empresa</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm mb-2">
                          {formatCurrency(invoice.total_amount)} {invoice.currency || 'MXN'}
                        </div>
                        <Button
                          size="sm"
                          variant={selected ? "secondary" : "default"}
                          onClick={() => handleAddInvoice(invoice)}
                          disabled={selected}
                        >
                          {selected ? "Agregado" : <><Plus className="h-3 w-3 mr-1" />Agregar</>}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

