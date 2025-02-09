
import React from "react";
import { format } from "date-fns";
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
import { useUnpaidInvoicesQuery } from "../../hooks/usePayableQueries";

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
  const { data: invoices } = useUnpaidInvoicesQuery();

  return (
    <FormField
      control={form.control}
      name="invoice_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Factura (Opcional)</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(parseInt(value))}
            defaultValue={field.value?.toString()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar factura" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {invoices?.map((invoice) => (
                <SelectItem key={invoice.id} value={invoice.id.toString()}>
                  {invoice.invoice_number} - {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
