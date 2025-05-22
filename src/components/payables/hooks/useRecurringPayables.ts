
import { PayableFormData } from "../types/payableTypes";
import { supabase } from "@/integrations/supabase/client";
import { generateNextRecurringPayables } from "./utils/recurringPayableUtils";

export async function generateRecurringPayables(
  formData: PayableFormData,
  startDate: Date | null = null,
  parentId: string | null = null,
  startSeriesNumber: number = 1
): Promise<number | undefined> {
  if (!formData.is_recurring || !formData.recurrence_pattern || !formData.recurrence_end_date) {
    return;
  }
  
  return generateNextRecurringPayables(
    formData,
    startDate || formData.due_date,
    parentId || (await createParentPayable(formData)),
    startSeriesNumber
  );
}

async function createParentPayable(formData: PayableFormData): Promise<string> {
  // Create a parent payable that will be referenced by all recurring instances
  const { data, error } = await supabase
    .from('accounts_payable')
    .insert([
      {
        client_id: formData.client_id,
        invoice_id: formData.invoice_id,
        amount: formData.amount,
        due_date: formData.due_date.toISOString().split('T')[0],
        payment_term: formData.payment_term,
        notes: formData.notes,
        status: 'pending',
        chart_account_id: formData.chart_account_id === "none" ? null : formData.chart_account_id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        is_recurring: true,
        recurrence_pattern: formData.recurrence_pattern,
        recurrence_day: formData.recurrence_day,
        recurrence_end_date: formData.recurrence_end_date 
          ? formData.recurrence_end_date.toISOString().split('T')[0] 
          : null
      }
    ])
    .select('id')
    .single();
    
  if (error) throw error;
  return data.id;
}
