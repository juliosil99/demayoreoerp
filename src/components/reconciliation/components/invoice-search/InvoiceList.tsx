
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, FileText, Users, Building2 } from "lucide-react";
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import { CurrencyBadge } from "../CurrencyBadge";
import { useCurrencyCalculator } from "../../hooks/calculation/useCurrencyCalculator";

interface InvoiceListProps {
  filteredInvoices: any[];
  tempSelectedInvoices: any[];
  toggleInvoiceSelection: (invoice: any) => void;
  selectedExpense?: any;
}

export function InvoiceList({ 
  filteredInvoices, 
  tempSelectedInvoices, 
  toggleInvoiceSelection,
  selectedExpense 
}: InvoiceListProps) {
  const { getDisplayAmounts } = useCurrencyCalculator();
  
  if (filteredInvoices.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No se encontraron facturas que coincidan con la búsqueda</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto space-y-2">
      {filteredInvoices.map((invoice) => {
        const isSelected = tempSelectedInvoices.some(inv => inv.id === invoice.id);
        const isCredit = invoice.invoice_type === 'E';
        const isPayroll = invoice.invoice_type === 'N';
        const invoiceCurrency = invoice.currency || 'MXN';
        
        // Get display amounts if we have expense context
        let displayInfo = null;
        if (selectedExpense) {
          const { invoice: invoiceDisplay } = getDisplayAmounts(selectedExpense, invoice);
          displayInfo = invoiceDisplay;
        }
        
        const currencyMatch = selectedExpense && 
          (selectedExpense.currency || 'MXN') === invoiceCurrency;

        // Las notas de crédito (tipo 'E') no requieren conversión porque restan automáticamente
        const requiresConversion = !isCredit && selectedExpense && !currencyMatch;

        // Determine invoice type and styling
        const getInvoiceTypeInfo = () => {
          if (isPayroll) {
            return {
              icon: Users,
              label: "Nómina",
              bgColor: "bg-blue-50 border-blue-200",
              selectedColor: "bg-blue-100 border-blue-300",
              textColor: "text-blue-700",
              description: "Factura de nómina emitida por la empresa"
            };
          } else if (isCredit) {
            return {
              icon: Building2,
              label: "Nota de Crédito",
              bgColor: "bg-red-50 border-red-200", 
              selectedColor: "bg-red-100 border-red-300",
              textColor: "text-red-700",
              description: "Nota de crédito"
            };
          } else {
            return {
              icon: FileText,
              label: "Factura",
              bgColor: "bg-gray-50",
              selectedColor: "bg-blue-50 border-blue-200",
              textColor: "text-gray-700",
              description: "Factura regular"
            };
          }
        };

        const typeInfo = getInvoiceTypeInfo();
        const TypeIcon = typeInfo.icon;

        return (
          <Card 
            key={invoice.id} 
            className={`cursor-pointer transition-colors ${
              isSelected 
                ? typeInfo.selectedColor
                : `${typeInfo.bgColor} hover:bg-gray-100`
            }`}
            onClick={() => toggleInvoiceSelection(invoice)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <TypeIcon className={`h-4 w-4 ${typeInfo.textColor}`} />
                      <h4 className="font-medium text-sm">
                        {isPayroll ? invoice.receiver_name : invoice.issuer_name}
                      </h4>
                      {isPayroll && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {typeInfo.label}
                        </span>
                      )}
                      {isCredit && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          {typeInfo.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <CurrencyBadge 
                        currency={invoiceCurrency}
                        amount={invoice.total_amount}
                        convertedAmount={displayInfo?.converted?.amount}
                        convertedCurrency={displayInfo?.converted?.currency}
                        exchangeRate={invoice.exchange_rate}
                        showConversion={!!displayInfo?.converted}
                      />
                      {requiresConversion && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                          Conversión requerida
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>
                      Factura: {invoice.invoice_number || 'N/A'} | 
                      Fecha: {formatCardDate(invoice.invoice_date)}
                      {isPayroll && (
                        <span className="ml-2 text-blue-600 text-xs">
                          (Emitida por empresa)
                        </span>
                      )}
                    </span>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(invoice.total_amount)} {invoiceCurrency}
                      </div>
                      {displayInfo?.converted && (
                        <div className="text-xs text-gray-500">
                          ≈ {formatCurrency(displayInfo.converted.amount)} {displayInfo.converted.currency}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="ml-4 flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
