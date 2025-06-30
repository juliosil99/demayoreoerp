
import { Card, CardContent } from "@/components/ui/card";
import { Check, FileText, Users, Building2 } from "lucide-react";
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import { CurrencyBadge } from "../CurrencyBadge";

interface InvoiceListProps {
  invoices: any[];
  selectedInvoices: any[];
  onInvoiceToggle: (invoice: any) => void;
  isLoading?: boolean;
}

export function InvoiceList({ 
  invoices, 
  selectedInvoices,
  onInvoiceToggle,
  isLoading = false 
}: InvoiceListProps) {
  
  if (isLoading) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Cargando facturas...</p>
      </div>
    );
  }
  
  if (invoices.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No se encontraron facturas que coincidan con la búsqueda</p>
      </div>
    );
  }

  const isInvoiceSelected = (invoice: any) => {
    return selectedInvoices.some(selected => selected.id === invoice.id);
  };

  return (
    <div className="max-h-96 overflow-y-auto space-y-2">
      {invoices.map((invoice) => {
        const isSelected = isInvoiceSelected(invoice);
        const isCredit = invoice.invoice_type === 'E';
        const isPayroll = invoice.invoice_type === 'N';
        const invoiceCurrency = invoice.currency || 'MXN';

        // Determine invoice type and styling
        const getInvoiceTypeInfo = () => {
          if (isPayroll) {
            return {
              icon: Users,
              label: "Nómina",
              bgColor: isSelected ? "bg-blue-100 border-blue-300" : "bg-blue-50 border-blue-200",
              textColor: "text-blue-700",
              description: "Factura de nómina emitida por la empresa"
            };
          } else if (isCredit) {
            return {
              icon: Building2,
              label: "Nota de Crédito",
              bgColor: isSelected ? "bg-red-100 border-red-300" : "bg-red-50 border-red-200", 
              textColor: "text-red-700",
              description: "Nota de crédito"
            };
          } else {
            return {
              icon: FileText,
              label: "Factura",
              bgColor: isSelected ? "bg-green-100 border-green-300" : "bg-gray-50",
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
            className={`cursor-pointer transition-colors border-2 ${typeInfo.bgColor} hover:bg-gray-100 ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onInvoiceToggle(invoice)}
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
                      {isSelected && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <CurrencyBadge 
                        currency={invoiceCurrency}
                        amount={invoice.total_amount}
                      />
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
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
