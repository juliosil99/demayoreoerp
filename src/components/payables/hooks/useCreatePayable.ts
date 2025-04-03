
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PayableFormData } from "../types/payableTypes";
import { generateRecurringPayables } from "./useRecurringPayables";

export function useCreatePayable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PayableFormData) => {
      const dueDate = new Date(data.due_date);
      const dueDateString = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
      
      // Insert the original payable
      const { data: newPayable, error } = await supabase
        .from('accounts_payable')
        .insert([{
          client_id: data.client_id,
          invoice_id: data.invoice_id,
          amount: data.amount,
          due_date: dueDateString,
          payment_term: data.payment_term,
          notes: data.notes,
          status: 'pending',
          chart_account_id: data.chart_account_id === "none" ? null : data.chart_account_id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          is_recurring: data.is_recurring,
          recurrence_pattern: data.recurrence_pattern,
          recurrence_day: data.recurrence_day,
          recurrence_end_date: data.recurrence_end_date 
            ? new Date(data.recurrence_end_date).toISOString().split('T')[0]
            : null,
          series_number: 0 // The original is series #0
        }])
        .select('id')
        .single();

      if (error) throw error;

      // Generate recurring payables if this is a recurring payment
      if (data.is_recurring && data.recurrence_pattern && data.recurrence_end_date) {
        const seriesCount = await generateRecurringPayables(data, dueDate, newPayable.id);
        return { id: newPayable.id, seriesCount };
      }
      
      return { id: newPayable.id, seriesCount: 0 };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      if (result.seriesCount > 0) {
        toast.success(`Cuenta por pagar creada con ${result.seriesCount} pagos recurrentes`);
      } else {
        toast.success("Cuenta por pagar creada exitosamente");
      }
    },
    onError: (error) => {
      toast.error("Error al crear la cuenta por pagar");
    },
  });
}
