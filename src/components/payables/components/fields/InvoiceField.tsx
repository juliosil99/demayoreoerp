
import React, { useState, useMemo } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useInvoiceQuery } from "../../hooks/usePayableQueries";
import { formatCurrency } from "@/utils/formatters";
import { PayableFormData } from "../../types/payableTypes";

interface InvoiceFieldProps {
  form: UseFormReturn<PayableFormData>;
}

export function InvoiceField({ form }: InvoiceFieldProps) {
  const client_id = form.watch('client_id');
  
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: invoices, isLoading } = useInvoiceQuery(client_id);
  
  // Filter invoices based on search term
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    if (!searchTerm) return invoices;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return invoices.filter(invoice => 
      (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(lowerSearchTerm)) ||
      (invoice.uuid && invoice.uuid.toLowerCase().includes(lowerSearchTerm)) ||
      (invoice.total_amount && invoice.total_amount.toString().includes(searchTerm))
    );
  }, [invoices, searchTerm]);

  const handleSelectChange = (value: string) => {
    // Handle the "none" value specially
    if (value === "none") {
      form.setValue('invoice_id', null);
      
      // Don't clear the amount, let the user specify it manually
    } else {
      const invoiceId = parseInt(value);
      form.setValue('invoice_id', invoiceId);
      
      // Find the invoice to get its amount
      const selectedInvoice = invoices?.find(inv => inv.id === invoiceId);
      if (selectedInvoice && selectedInvoice.total_amount) {
        form.setValue('amount', selectedInvoice.total_amount);
      }
    }
  };

  return (
    <FormField
      control={form.control}
      name="invoice_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Factura (Opcional)</FormLabel>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Buscar por número o monto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            <Select 
              onValueChange={handleSelectChange} 
              value={field.value ? field.value.toString() : "none"}
              disabled={!client_id}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar factura (opcional)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Ninguna factura</SelectItem>
                {!isLoading && filteredInvoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id.toString()}>
                    {invoice.invoice_number || invoice.uuid.substring(0, 8)} - {formatCurrency(invoice.total_amount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
