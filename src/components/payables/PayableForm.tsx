
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PayableFormFields } from "./components/PayableFormFields";
import { zodResolver } from "@hookform/resolvers/zod";
import { payableFormSchema } from "./schema/payableSchema";
import type { PayableFormData } from "./types/payableTypes";

interface PayableFormProps {
  onSubmit: (data: PayableFormData) => void;
  isSubmitting: boolean;
  initialData?: PayableFormData;
}

export function PayableForm({ onSubmit, isSubmitting, initialData }: PayableFormProps) {
  const form = useForm<PayableFormData>({
    resolver: zodResolver(payableFormSchema),
    defaultValues: initialData || {
      client_id: "", 
      invoice_id: null,
      amount: 0,
      payment_term: 30,
      notes: null,
      due_date: new Date(), // Default to today
      chart_account_id: null,
      is_recurring: false,
      recurrence_pattern: null,
      recurrence_day: null,
      recurrence_end_date: null
    },
  });

  const handleSubmit = (data: PayableFormData) => {
    // Convert "none" to null for chart_account_id
    if (data.chart_account_id === "none") {
      data.chart_account_id = null;
    }
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <PayableFormFields form={form} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : initialData ? "Actualizar" : "Guardar"}
        </Button>
      </form>
    </Form>
  );
}
