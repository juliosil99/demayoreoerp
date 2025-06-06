
import { supabase } from "@/integrations/supabase/client";

export const markPayableAsPaid = async (payableId: string): Promise<boolean> => {
  console.log('Marking payable as paid:', payableId);
  
  try {
    // Get the payable details first to check if it has an invoice
    const { data: payable, error: payableError } = await supabase
      .from('accounts_payable')
      .select('invoice_id')
      .eq('id', payableId)
      .single();

    if (payableError) {
      console.error('Error fetching payable:', payableError);
      throw new Error(`Error al obtener la cuenta por pagar: ${payableError.message}`);
    }

    // Update the payable status to 'paid'
    // The database trigger will automatically create the expense
    const { error: updateError } = await supabase
      .from('accounts_payable')
      .update({ 
        status: 'paid' as const
      })
      .eq('id', payableId);

    if (updateError) {
      console.error('Error updating payable status:', updateError);
      throw new Error(`Error al marcar como pagada: ${updateError.message}`);
    }

    console.log('Payable marked as paid successfully, expense created by trigger');
    
    // Return whether the payable has an invoice for the success message
    return !!payable.invoice_id;
    
  } catch (error) {
    console.error('Error in markPayableAsPaid:', error);
    throw error;
  }
};
