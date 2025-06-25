
import { supabase } from "@/integrations/supabase/client";

export const markPayableAsPaid = async (payableId: string): Promise<boolean> => {
  console.log('🔄 Starting enhanced markPayableAsPaid process for:', payableId);
  
  try {
    // Step 1: Get the payable details with detailed verification
    const { data: payable, error: payableError } = await supabase
      .from('accounts_payable')
      .select('id, invoice_id, expense_id, status, amount, user_id, client_id')
      .eq('id', payableId)
      .single();

    if (payableError) {
      console.error('❌ Error fetching payable:', payableError);
      throw new Error(`Error al obtener la cuenta por pagar: ${payableError.message}`);
    }

    console.log('📋 Enhanced payable state verification:', {
      id: payable.id,
      status: payable.status,
      hasExpenseId: !!payable.expense_id,
      expenseId: payable.expense_id,
      amount: payable.amount
    });

    // Step 2: Enhanced verification - check if already paid
    if (payable.status === 'paid') {
      console.log('⚠️ Payable is already marked as paid, aborting');
      throw new Error('Esta cuenta por pagar ya está marcada como pagada');
    }

    // Step 3: Enhanced duplicate check - verify no existing expenses
    if (payable.expense_id) {
      console.log('⚠️ Expense already linked to this payable:', payable.expense_id);
      
      // Verify the expense still exists
      const { data: existingExpense, error: expenseCheckError } = await supabase
        .from('expenses')
        .select('id, description, amount')
        .eq('id', payable.expense_id)
        .single();

      if (!expenseCheckError && existingExpense) {
        console.log('✅ Expense already exists and is valid, just updating status');
        
        // Just update the status without creating new expense
        const { error: updateError } = await supabase
          .from('accounts_payable')
          .update({ status: 'paid' as const })
          .eq('id', payableId);

        if (updateError) {
          console.error('❌ Error updating payable status:', updateError);
          throw new Error(`Error al actualizar estado: ${updateError.message}`);
        }

        console.log('✅ Payable status updated successfully (existing expense)');
        return !!payable.invoice_id;
      }
    }

    // Step 4: Additional safety check - look for expenses that might already exist
    const { data: potentialDuplicates, error: duplicateCheckError } = await supabase
      .from('expenses')
      .select('id, description, amount, supplier_id')
      .eq('supplier_id', payable.client_id)
      .eq('amount', payable.amount)
      .eq('date', new Date().toISOString().split('T')[0])
      .like('description', `%${payableId}%`);

    if (duplicateCheckError) {
      console.warn('⚠️ Could not check for duplicate expenses:', duplicateCheckError);
    } else if (potentialDuplicates && potentialDuplicates.length > 0) {
      console.warn('⚠️ Found potential duplicate expenses:', potentialDuplicates);
      throw new Error('Ya existe un gasto similar para esta cuenta por pagar');
    }

    // Step 5: Update the payable status to 'paid'
    // The enhanced database trigger will automatically create the expense
    console.log('🔄 Updating payable status to paid (enhanced trigger will handle expense)...');
    const { error: updateError } = await supabase
      .from('accounts_payable')
      .update({ status: 'paid' as const })
      .eq('id', payableId);

    if (updateError) {
      console.error('❌ Error updating payable status:', updateError);
      throw new Error(`Error al marcar como pagada: ${updateError.message}`);
    }

    console.log('✅ Payable marked as paid successfully with enhanced trigger');
    
    // Step 6: Verify the expense was created by the enhanced trigger
    const verificationPromise = new Promise<void>((resolve) => {
      setTimeout(async () => {
        try {
          const { data: updatedPayable } = await supabase
            .from('accounts_payable')
            .select('expense_id')
            .eq('id', payableId)
            .single();
          
          console.log('🔍 Enhanced post-update verification:', {
            payableId,
            expenseCreated: !!updatedPayable?.expense_id,
            expenseId: updatedPayable?.expense_id
          });
          
          if (!updatedPayable?.expense_id) {
            console.warn('⚠️ Enhanced trigger may not have created expense properly');
          }
          
          resolve();
        } catch (verificationError) {
          console.error('⚠️ Enhanced verification error:', verificationError);
          resolve();
        }
      }, 1500); // Increased delay for proper trigger execution
    });
    
    // Don't await verification to avoid blocking the response
    verificationPromise.catch(() => {});
    
    // Return whether the payable has an invoice for the success message
    return !!payable.invoice_id;
    
  } catch (error) {
    console.error('❌ Error in enhanced markPayableAsPaid:', error);
    throw error;
  }
};

// Enhanced function to debug payable expenses with better error handling
export const debugPayableExpenses = async (payableId: string) => {
  try {
    console.log('🔍 Starting enhanced debug for payable:', payableId);
    
    const { data, error } = await supabase.functions.invoke('debug-payable-expenses', {
      body: { payableId }
    });

    if (error) {
      console.error('Enhanced debug function error:', error);
      return null;
    }

    console.log('🔍 Enhanced debug results:', data);
    return data;
  } catch (error) {
    console.error('Error calling enhanced debug function:', error);
    return null;
  }
};
