
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateRecurringPayables } from "./useRecurringPayables";
import { PayableFormData } from "../types/payableTypes";
import { addMonths, addWeeks, addYears } from "date-fns";

export function useMarkPayableAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payableId: string) => {
      // Fetch the payable details to determine if it's a recurring payable
      const { data: payable, error: fetchError } = await supabase
        .from('accounts_payable')
        .select(`
          *,
          client:contacts!client_id(name, rfc),
          invoice:invoices!invoice_id(invoice_number, invoice_date, id, uuid)
        `)
        .eq('id', payableId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Mark the current payable as paid
      const { error } = await supabase
        .from('accounts_payable')
        .update({ status: 'paid' })
        .eq('id', payableId);

      if (error) throw error;
      
      // Check if this is a recurring payable and if it's the last one in the current series
      if (payable.is_recurring && payable.recurrence_pattern && payable.recurrence_end_date) {
        // Count remaining pending payables in the series
        const { count, error: countError } = await supabase
          .from('accounts_payable')
          .select('*', { count: 'exact', head: true })
          .eq('parent_payable_id', payable.parent_payable_id || payable.id)
          .eq('status', 'pending');
        
        if (countError) throw countError;
        
        // If this was the last pending payable in the series, check if we need to generate more
        if (count === 0) {
          // Get the parent payable or use the current one if it is the parent
          const parentId = payable.parent_payable_id || payable.id;
          
          // Prepare payable form data for generating new recurring entries
          const formData: PayableFormData = {
            client_id: payable.client_id,
            invoice_id: payable.invoice_id,
            amount: payable.amount,
            due_date: new Date(payable.due_date),
            payment_term: payable.payment_term,
            notes: payable.notes,
            chart_account_id: payable.chart_account_id,
            is_recurring: payable.is_recurring,
            recurrence_pattern: payable.recurrence_pattern,
            recurrence_day: payable.recurrence_day,
            recurrence_end_date: new Date(payable.recurrence_end_date)
          };
          
          // Calculate new recurrence end date - extend by 3 more occurrences
          let newEndDate = new Date(payable.recurrence_end_date);
          if (payable.recurrence_pattern === 'monthly') {
            newEndDate = addMonths(newEndDate, 3);
          } else if (payable.recurrence_pattern === 'weekly') {
            newEndDate = addWeeks(newEndDate, 3);
          } else if (payable.recurrence_pattern === 'yearly') {
            newEndDate = addYears(newEndDate, 1);
          }
          
          formData.recurrence_end_date = newEndDate;
          
          // Get the last due date in the series to start the new series from there
          const { data: lastPayable, error: lastError } = await supabase
            .from('accounts_payable')
            .select('due_date, series_number')
            .eq('parent_payable_id', parentId)
            .order('due_date', { ascending: false })
            .limit(1)
            .single();
            
          if (!lastError && lastPayable) {
            // Generate new recurring payables starting from the last due date
            const lastDueDate = new Date(lastPayable.due_date);
            const seriesNumber = (lastPayable.series_number || 0);
            
            // Use the original function to generate recurring payables
            await generateNextRecurringPayables(formData, lastDueDate, parentId, seriesNumber);
            toast.info("Se han generado nuevos pagos recurrentes");
          }
        }
      }
      
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
}

// Function to generate next batch of recurring payables
async function generateNextRecurringPayables(
  originalPayable: PayableFormData,
  lastDueDate: Date,
  parentId: string,
  lastSeriesNumber: number
) {
  const { is_recurring, recurrence_pattern, recurrence_day, recurrence_end_date } = originalPayable;
  
  if (!is_recurring || !recurrence_pattern || !recurrence_end_date) {
    return;
  }
  
  const endDate = new Date(recurrence_end_date);
  
  const series: { due_date: string; series_number: number }[] = [];
  let currentDate = new Date(lastDueDate);
  let seriesNumber = lastSeriesNumber + 1;
  
  // Start from next period based on the recurrence pattern
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
        parent_payable_id: parentId,
        series_number: item.series_number,
        is_recurring: true,
        recurrence_pattern: originalPayable.recurrence_pattern,
        recurrence_day: originalPayable.recurrence_day,
        recurrence_end_date: originalPayable.recurrence_end_date 
          ? new Date(originalPayable.recurrence_end_date).toISOString().split('T')[0]
          : null
      }]);
      
    if (error) {
      throw error;
    }
  }
  
  return series.length;
}
