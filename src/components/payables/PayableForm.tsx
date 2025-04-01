
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PayableFormFields } from "./components/PayableFormFields";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const payableFormSchema = z.object({
  client_id: z.string().min(1, "Proveedor es requerido"),
  invoice_id: z.number().nullable(),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  due_date: z.date(),
  payment_term: z.number(),
  notes: z.string().nullable()
});

export type PayableFormData = z.infer<typeof payableFormSchema>;

interface PayableFormProps {
  onSubmit: (data: PayableFormData) => void;
  isSubmitting: boolean;
}

export function PayableForm({ onSubmit, isSubmitting }: PayableFormProps) {
  const form = useForm<PayableFormData>({
    resolver: zodResolver(payableFormSchema),
    defaultValues: {
      client_id: "", 
      invoice_id: null,
      amount: 0,
      payment_term: 30,
      notes: null,
      due_date: new Date(), // Default to today
    },
  });

  // Add debug logs
  console.log('Form object:', form);
  console.log('Form values:', form.watch());
  console.log('Form errors:', form.formState.errors);

  // Monitor for payment_term changes
  const payment_term = form.watch('payment_term');
  
  // When payment term changes, DON'T automatically update the due date
  // This allows the user to manually select a date regardless of the payment term

  // When invoice changes, update the amount if possible
  React.useEffect(() => {
    const invoice_id = form.watch('invoice_id');
    if (invoice_id) {
      // Fetch invoice details to get the amount
      const fetchInvoiceAmount = async () => {
        const { data, error } = await supabase
          .from('invoices')
          .select('total_amount')
          .eq('id', invoice_id)
          .single();
        
        if (!error && data && data.total_amount) {
          form.setValue('amount', data.total_amount);
        }
      };
      
      fetchInvoiceAmount();
    }
  }, [form.watch('invoice_id')]);

  const handleSubmit = (data: PayableFormData) => {
    console.log('Submitting data:', data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <PayableFormFields form={form} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </Form>
  );
}
