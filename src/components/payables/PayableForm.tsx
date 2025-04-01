
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
