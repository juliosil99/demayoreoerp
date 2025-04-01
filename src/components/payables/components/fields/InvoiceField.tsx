
import React, { useState } from "react";
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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useInvoiceQuery } from "../../hooks/usePayableQueries";
import { formatCurrency } from "@/utils/formatters";

interface PayableFormData {
  client_id: string;
  invoice_id: number | null;
  amount: number;
  due_date: Date;
  payment_term: number;
  notes: string | null;
}

interface InvoiceFieldProps {
  form: UseFormReturn<PayableFormData>;
}

export function InvoiceField({ form }: InvoiceFieldProps) {
  const client_id = form.watch('client_id');
  
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: invoices, isLoading } = useInvoiceQuery(client_id);
  
  // Filter invoices based on search term
  const filteredInvoices = React.useMemo(() => {
    if (!invoices) return [];
    if (!searchTerm) return invoices;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return invoices.filter(invoice => 
      (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(lowerSearchTerm)) ||
      (invoice.uuid && invoice.uuid.toLowerCase().includes(lowerSearchTerm)) ||
      (invoice.total_amount && invoice.total_amount.toString().includes(searchTerm))
    );
  }, [invoices, searchTerm]);

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
              onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
              value={field.value ? field.value.toString() : ""}
              disabled={!client_id}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar factura (opcional)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Ninguna factura</SelectItem>
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
