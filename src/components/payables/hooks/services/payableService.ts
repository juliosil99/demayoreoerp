
import { supabase } from "@/integrations/supabase/client";

/**
 * Marks a payable as paid
 * @param payableId - The ID of the payable to mark as paid
 * @returns A boolean indicating if the payable has an invoice
 */
export async function markPayableAsPaid(payableId: string): Promise<boolean> {
  // Step 1: Update the payable status to 'paid'
  const { error } = await supabase
    .from('accounts_payable')
    .update({ status: 'paid' })
    .eq('id', payableId);

  if (error) {
    throw new Error(`Error marking payable as paid: ${error.message}`);
  }

  // Step 2: Check if there's an invoice associated with this payable
  const { data: payable } = await supabase
    .from('accounts_payable')
    .select('invoice_id')
    .eq('id', payableId)
    .single();

  // Return whether the payable has an invoice (used for toasts)
  return !!payable?.invoice_id;
}
