import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAvailableInvoices, AvailableInvoice } from "../hooks/useAvailableInvoices";
import { FormFieldProps } from "./types";
import { format } from "date-fns";

export function InvoiceSelector({ formData, setFormData }: FormFieldProps) {
  const { data: availableInvoices, isLoading } = useAvailableInvoices();

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = availableInvoices?.find(inv => inv.id === parseInt(invoiceId));
    if (invoice) {
      setFormData(prev => ({
        ...prev,
        selected_invoice_id: invoice.id,
        // Clear any uploaded file when selecting an invoice
        invoice_file: undefined,
        invoice_filename: undefined,
        invoice_file_path: undefined,
      }));
    }
  };

  const handleRemoveSelection = () => {
    setFormData(prev => ({
      ...prev,
      selected_invoice_id: undefined,
    }));
  };

  const selectedInvoice = availableInvoices?.find(inv => inv.id === formData.selected_invoice_id);

  const formatInvoiceDisplay = (invoice: AvailableInvoice) => {
    const parts = [];
    
    if (invoice.serie && invoice.invoice_number) {
      parts.push(`${invoice.serie}-${invoice.invoice_number}`);
    } else if (invoice.invoice_number) {
      parts.push(invoice.invoice_number);
    } else {
      parts.push(`ID: ${invoice.id}`);
    }
    
    if (invoice.total_amount) {
      parts.push(`$${invoice.total_amount.toLocaleString()}`);
    }
    
    if (invoice.issuer_name) {
      parts.push(invoice.issuer_name);
    }
    
    return parts.join(" - ");
  };

  return (
    <div className="space-y-2">
      <Label>Seleccionar Factura Existente</Label>
      
      {!selectedInvoice ? (
        <Select onValueChange={handleInvoiceSelect} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Cargando facturas..." : "Selecciona una factura no conciliada"} />
          </SelectTrigger>
          <SelectContent>
            {availableInvoices?.map((invoice) => (
              <SelectItem key={invoice.id} value={invoice.id.toString()}>
                <div className="flex flex-col">
                  <span className="font-medium">{formatInvoiceDisplay(invoice)}</span>
                  <span className="text-xs text-muted-foreground">
                    {invoice.invoice_date && format(new Date(invoice.invoice_date), "dd/MM/yyyy")} 
                    {invoice.currency && ` - ${invoice.currency}`}
                  </span>
                </div>
              </SelectItem>
            ))}
            {availableInvoices?.length === 0 && (
              <SelectItem value="no-invoices" disabled>
                No hay facturas disponibles para conciliar
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      ) : (
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium text-sm">{formatInvoiceDisplay(selectedInvoice)}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {selectedInvoice.invoice_date && format(new Date(selectedInvoice.invoice_date), "dd/MM/yyyy")}
                  </Badge>
                  {selectedInvoice.currency && (
                    <Badge variant="outline" className="text-xs">
                      {selectedInvoice.currency}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  RFC: {selectedInvoice.issuer_rfc}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Solo se muestran facturas de proveedores no conciliadas
      </p>
    </div>
  );
}