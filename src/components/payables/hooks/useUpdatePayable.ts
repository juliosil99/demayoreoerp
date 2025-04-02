
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PayableFormData } from "../types/payableTypes";
import { generateRecurringPayables } from "./useRecurringPayables";

export interface UpdatePayableParams {
  id: string;
  data: PayableFormData;
  updateSeries?: boolean;
}

export function useUpdatePayable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data, updateSeries = false }: UpdatePayableParams) => {
      const dueDate = new Date(data.due_date);
      const dueDateString = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
      
      // Update the original payable
      const { error } = await supabase
        .from('accounts_payable')
        .update({
          client_id: data.client_id,
          invoice_id: data.invoice_id,
          amount: data.amount,
          due_date: dueDateString,
          payment_term: data.payment_term,
          notes: data.notes,
          chart_account_id: data.chart_account_id === "none" ? null : data.chart_account_id,
          is_recurring: data.is_recurring,
          recurrence_pattern: data.recurrence_pattern,
          recurrence_day: data.recurrence_day,
          recurrence_end_date: data.recurrence_end_date 
            ? new Date(data.recurrence_end_date).toISOString().split('T')[0]
            : null
        })
        .eq('id', id);

      if (error) throw error;

      // If this is a parent payable and we want to update the entire series
      if (updateSeries) {
        // Delete all future payables in the series (ones with due dates >= today)
        const today = new Date().toISOString().split('T')[0];
        
        const { error: deleteError } = await supabase
          .from('accounts_payable')
          .delete()
          .eq('parent_payable_id', id)
          .gte('due_date', today);
          
        if (deleteError) throw deleteError;
        
        // Generate new series if this is still a recurring payment
        if (data.is_recurring && data.recurrence_pattern && data.recurrence_end_date) {
          await generateRecurringPayables(data, dueDate, id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      toast.success("Cuenta por pagar actualizada exitosamente");
    },
    onError: (error) => {
      console.error('Error updating payable:', error);
      toast.error("Error al actualizar la cuenta por pagar");
    },
  });
}
