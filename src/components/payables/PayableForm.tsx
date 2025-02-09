
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PayableFormFields } from "./components/PayableFormFields";

interface PayableFormData {
  client_id: string;
  invoice_id: number | null;
  amount: number;
  due_date: Date;
  payment_term: number;
  notes: string | null;
}

interface PayableFormProps {
  onSubmit: (data: PayableFormData) => void;
  isSubmitting: boolean;
}

export function PayableForm({ onSubmit, isSubmitting }: PayableFormProps) {
  const form = useForm<PayableFormData>({
    defaultValues: {
      invoice_id: null,
      amount: 0,
      payment_term: 30,
      notes: null,
    },
  });

  // Add debug logs
  console.log('Form object:', form);
  console.log('Form values:', form.watch());
  console.log('Form errors:', form.formState.errors);

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
