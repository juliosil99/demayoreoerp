
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountPayable } from "@/types/payables";
import { toast } from "sonner";
import { PayableFormData } from "../types/payableTypes";

// Function to generate recurring payables
const generateRecurringPayables = async (
  originalPayable: PayableFormData, 
  originalDueDate: Date,
  originalId: string
) => {
  const { is_recurring, recurrence_pattern, recurrence_day, recurrence_end_date } = originalPayable;
  
  if (!is_recurring || !recurrence_pattern || !recurrence_end_date) {
    return;
  }
  
  const endDate = new Date(recurrence_end_date);
  const dueDateString = originalDueDate.toISOString().split('T')[0];
  
  const series: { due_date: string; series_number: number }[] = [];
  let currentDate = new Date(originalDueDate);
  let seriesNumber = 1;
  
  // Start from next month since the first one is already created
  if (recurrence_pattern === 'monthly') {
    currentDate.setMonth(currentDate.getMonth() + 1);
    
    while (currentDate <= endDate) {
      // If recurrence_day is specified, set the day of month
      if (recurrence_day) {
        // Handle edge cases for months with fewer days
        const maxDaysInMonth = new Date(
          currentDate.getFullYear(), 
          currentDate.getMonth() + 1, 
          0
        ).getDate();
        
        const targetDay = Math.min(recurrence_day, maxDaysInMonth);
        currentDate.setDate(targetDay);
      }
      
      if (currentDate <= endDate) {
        series.push({
          due_date: currentDate.toISOString().split('T')[0],
          series_number: seriesNumber++
        });
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  } else if (recurrence_pattern === 'weekly') {
    currentDate.setDate(currentDate.getDate() + 7);
    
    while (currentDate <= endDate) {
      series.push({
        due_date: currentDate.toISOString().split('T')[0],
        series_number: seriesNumber++
      });
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
  } else if (recurrence_pattern === 'yearly') {
    currentDate.setFullYear(currentDate.getFullYear() + 1);
    
    while (currentDate <= endDate) {
      series.push({
        due_date: currentDate.toISOString().split('T')[0],
        series_number: seriesNumber++
      });
      
      // Move to next year
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
  }
  
  // Insert all recurring payables
  for (const item of series) {
    const { error } = await supabase
      .from('accounts_payable')
      .insert([{
        client_id: originalPayable.client_id,
        invoice_id: originalPayable.invoice_id,
        amount: originalPayable.amount,
        due_date: item.due_date,
        payment_term: originalPayable.payment_term,
        notes: originalPayable.notes,
        status: 'pending',
        chart_account_id: originalPayable.chart_account_id === "none" ? null : originalPayable.chart_account_id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        parent_payable_id: originalId,
        series_number: item.series_number,
        is_recurring: true,
        recurrence_pattern: originalPayable.recurrence_pattern,
        recurrence_day: originalPayable.recurrence_day,
        recurrence_end_date: originalPayable.recurrence_end_date 
          ? new Date(originalPayable.recurrence_end_date).toISOString().split('T')[0]
          : null
      }]);
      
    if (error) {
      console.error('Error creating recurring payable:', error);
      throw error;
    }
  }
  
  return series.length;
};

export function usePayables() {
  const queryClient = useQueryClient();

  const { data: payables, isLoading } = useQuery({
    queryKey: ["payables"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts_payable")
        .select(`
          *,
          client:contacts!client_id(name, rfc),
          invoice:invoices!invoice_id(invoice_number, invoice_date, id, uuid)
        `)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as AccountPayable[];
    },
  });

  const createPayable = useMutation({
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
      console.error('Error creating payable:', error);
      toast.error("Error al crear la cuenta por pagar");
    },
  });

  const updatePayable = useMutation({
    mutationFn: async ({ id, data, updateSeries = false }: { 
      id: string; 
      data: PayableFormData; 
      updateSeries?: boolean;
    }) => {
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

  const markAsPaid = useMutation({
    mutationFn: async (payableId: string) => {
      const { data: payable, error: fetchError } = await supabase
        .from('accounts_payable')
        .select('invoice_id')
        .eq('id', payableId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('accounts_payable')
        .update({ status: 'paid' })
        .eq('id', payableId);

      if (error) throw error;
      
      return !!payable.invoice_id;
    },
    onSuccess: (hasInvoice) => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      if (hasInvoice) {
        toast.success("Cuenta por pagar marcada como pagada y gasto creado con conciliación automática");
      } else {
        toast.success("Cuenta por pagar marcada como pagada y gasto creado");
      }
    },
    onError: (error) => {
      console.error('Error marking payable as paid:', error);
      toast.error("Error al marcar como pagada");
    },
  });

  return {
    payables,
    isLoading,
    createPayable,
    updatePayable,
    markAsPaid
  };
}
