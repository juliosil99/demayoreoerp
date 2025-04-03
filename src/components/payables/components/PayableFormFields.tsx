
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ClientField } from "./fields/ClientField";
import { InvoiceField } from "./fields/InvoiceField";
import { AmountField } from "./fields/AmountField";
import { PaymentTermField } from "./fields/PaymentTermField";
import { DueDateField } from "./fields/DueDateField";
import { NotesField } from "./fields/NotesField";
import { ChartAccountField } from "./fields/ChartAccountField";
import { RecurringPaymentFields } from "./fields/RecurringPaymentFields";
import { PayableFormData } from "../types/payableTypes";
import { SupplierChartAccountHandler } from "./fields/SupplierChartAccountHandler";

interface PayableFormFieldsProps {
  form: UseFormReturn<PayableFormData>;
}

export function PayableFormFields({ form }: PayableFormFieldsProps) {
  return (
    <>
      {/* This silent component handles setting the default chart account */}
      <SupplierChartAccountHandler form={form} />
      
      <ClientField form={form} />
      <InvoiceField form={form} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AmountField form={form} />
        <PaymentTermField form={form} />
      </div>
      <ChartAccountField form={form} />
      <DueDateField form={form} />
      <RecurringPaymentFields form={form} />
      <NotesField form={form} />
    </>
  );
}
