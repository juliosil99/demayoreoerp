
import React, { useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";

interface PayableFormFieldsProps {
  form: UseFormReturn<PayableFormData>;
}

export function PayableFormFields({ form }: PayableFormFieldsProps) {
  // When client changes, watch for supplier's default chart account
  const clientId = form.watch("client_id");
  
  useEffect(() => {
    if (clientId) {
      // Fetch supplier's default chart account
      const fetchSupplierDefaultChartAccount = async () => {
        try {
          const { data, error } = await supabase
            .from("contacts")
            .select("default_chart_account_id")
            .eq("id", clientId)
            .single();
          
          if (error) {
            console.error("Error fetching supplier default chart account:", error);
            return;
          }
          
          if (data && data.default_chart_account_id) {
            console.log("Found default chart account for supplier:", data.default_chart_account_id);
            form.setValue("chart_account_id", data.default_chart_account_id);
          }
        } catch (error) {
          console.error("Error in fetchSupplierDefaultChartAccount:", error);
        }
      };
      
      fetchSupplierDefaultChartAccount();
    }
  }, [clientId, form]);

  return (
    <>
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
