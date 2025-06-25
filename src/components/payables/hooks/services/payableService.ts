
import { supabase } from "@/integrations/supabase/client";

export const markPayableAsPaid = async (payableId: string): Promise<boolean> => {
  console.log('🔄 Starting markPayableAsPaid process for:', payableId);
  
  try {
    // Step 1: Get the payable details first to check current state
    const { data: payable, error: payableError } = await supabase
      .from('accounts_payable')
      .select('id, invoice_id, expense_id, status, amount, user_id')
      .eq('id', payableId)
      .single();

    if (payableError) {
      console.error('❌ Error fetching payable:', payableError);
      throw new Error(`Error al obtener la cuenta por pagar: ${payableError.message}`);
    }

    console.log('📋 Current payable state:', {
      id: payable.id,
      status: payable.status,
      hasExpenseId: !!payable.expense_id,
      expenseId: payable.expense_id
    });

    // Step 2: Check if already paid to prevent double processing
    if (payable.status === 'paid') {
      console.log('⚠️ Payable is already marked as paid, skipping');
      return !!payable.invoice_id;
    }

    // Step 3: Check if expense already exists to prevent duplication
    if (payable.expense_id) {
      console.log('⚠️ Expense already exists for this payable:', payable.expense_id);
      
      // Verify the expense still exists
      const { data: existingExpense, error: expenseCheckError } = await supabase
        .from('expenses')
        .select('id')
        .eq('id', payable.expense_id)
        .single();

      if (expenseCheckError) {
        console.log('🔧 Linked expense not found, will create new one');
      } else {
        console.log('✅ Expense already exists, just updating status');
        
        // Just update the status without creating new expense
        const { error: updateError } = await supabase
          .from('accounts_payable')
          .update({ status: 'paid' as const })
          .eq('id', payableId);

        if (updateError) {
          console.error('❌ Error updating payable status:', updateError);
          throw new Error(`Error al actualizar estado: ${updateError.message}`);
        }

        console.log('✅ Payable status updated successfully');
        return !!payable.invoice_id;
      }
    }

    // Step 4: Update the payable status to 'paid'
    // The database trigger will automatically create the expense if needed
    console.log('🔄 Updating payable status to paid...');
    const { error: updateError } = await supabase
      .from('accounts_payable')
      .update({ status: 'paid' as const })
      .eq('id', payableId);

    if (updateError) {
      console.error('❌ Error updating payable status:', updateError);
      throw new Error(`Error al marcar como pagada: ${updateError.message}`);
    }

    console.log('✅ Payable marked as paid successfully');
    
    // Step 5: Verify the expense was created by the trigger
    setTimeout(async () => {
      try {
        const { data: updatedPayable } = await supabase
          .from('accounts_payable')
          .select('expense_id')
          .eq('id', payableId)
          .single();
        
        console.log('🔍 Post-update verification:', {
          payableId,
          expenseCreated: !!updatedPayable?.expense_id,
          expenseId: updatedPayable?.expense_id
        });
      } catch (verificationError) {
        console.error('⚠️ Verification error:', verificationError);
      }
    }, 1000);
    
    // Return whether the payable has an invoice for the success message
    return !!payable.invoice_id;
    
  } catch (error) {
    console.error('❌ Error in markPayableAsPaid:', error);
    throw error;
  }
};

// New function to debug payable expenses
export const debugPayableExpenses = async (payableId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('debug-payable-expenses', {
      body: { payableId }
    });

    if (error) {
      console.error('Debug function error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error calling debug function:', error);
    return null;
  }
};
