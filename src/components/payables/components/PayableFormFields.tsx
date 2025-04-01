
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ClientField } from "./fields/ClientField";
import { InvoiceField } from "./fields/InvoiceField";
import { AmountField } from "./fields/AmountField";
import { PaymentTermField } from "./fields/PaymentTermField";
import { DueDateField } from "./fields/DueDateField";
import { NotesField } from "./fields/NotesField";
import { PayableFormData } from "../PayableForm";

interface PayableFormFieldsProps {
  form: UseFormReturn<PayableFormData>;
}

export function PayableFormFields({ form }: PayableFormFieldsProps) {
  return (
    <>
      <ClientField form={form} />
      <InvoiceField form={form} />
      <AmountField form={form} />
      <PaymentTermField form={form} />
      <DueDateField form={form} />
      <NotesField form={form} />
    </>
  );
}
