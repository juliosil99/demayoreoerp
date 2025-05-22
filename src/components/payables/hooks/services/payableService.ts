
import { supabase } from "@/integrations/supabase/client";
import { PayableFormData } from "../../types/payableTypes";
import { generateNextRecurringPayables } from "../utils/recurringPayableUtils";
import { addMonths, addWeeks, addYears } from "date-fns";

/**
 * Marks a payable as paid and handles any related operations
 */
export async function markPayableAsPaid(payableId: string): Promise<boolean> {
  try {
    // Fetch the payable details to determine if it's a recurring payable
    const { data: payable, error: fetchError } = await supabase
      .from('accounts_payable')
      .select(`
        *,
        client:contacts!client_id(name, rfc),
        invoice:invoices!invoice_id(invoice_number, invoice_date, id, uuid),
        expense_id
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
    
    // Check if expense was created (this should happen via the trigger automatically)
    if (!payable.expense_id) {
      console.log("Expense should be created via database trigger");
    }
    
    // Check if this is a recurring payable and if it's the last one in the current series
    if (payable.is_recurring && payable.recurrence_pattern && payable.recurrence_end_date) {
      await handleRecurringPayableSeries(payable);
    }
    
    return !!payable.invoice_id;
  } catch (error) {
    console.error("Error in marking payable as paid:", error);
    throw error;
  }
}

/**
 * Handles recurring payable series extension when marking a payable as paid
 */
async function handleRecurringPayableSeries(payable: any): Promise<void> {
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
      
      // Use the function to generate recurring payables
      await generateNextRecurringPayables(formData, lastDueDate, parentId, seriesNumber);
    }
  }
}
