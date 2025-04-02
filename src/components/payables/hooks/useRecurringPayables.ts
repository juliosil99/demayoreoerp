
import { supabase } from "@/integrations/supabase/client";
import { PayableFormData } from "../types/payableTypes";

/**
 * Generates recurring payables based on a parent payable
 */
export const generateRecurringPayables = async (
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
