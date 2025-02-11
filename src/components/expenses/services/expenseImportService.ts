
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const importExpenses = async (
  expenses: any[],
  userId: string,
  fileName: string,
  onProgress?: (successCount: number) => void
) => {
  let successCount = 0;
  let errorCount = 0;

  // Create import record
  const { data: importRecord, error: importError } = await supabase
    .from('expense_imports')
    .insert({
      filename: fileName,
      user_id: userId,
      total_rows: expenses.length
    })
    .select()
    .single();

  if (importError) {
    toast.error('Error al registrar la importación');
    return { successCount: 0, errorCount: 0 };
  }

  for (const expenseData of expenses) {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          ...expenseData,
          user_id: userId,
          amount: parseFloat(expenseData.amount.toString()),
          account_id: parseInt(expenseData.account_id.toString())
        });

      if (error) {
        console.error('Error importing expense:', error);
        errorCount++;
      } else {
        successCount++;
        
        // Update import record progress
        await supabase
          .from('expense_imports')
          .update({ 
            processed_rows: successCount,
            status: successCount === expenses.length ? 'completed' : 'processing'
          })
          .eq('id', importRecord.id);

        onProgress?.(successCount);
      }
    } catch (error) {
      console.error('Error processing expense:', error);
      errorCount++;
    }
  }

  return { successCount, errorCount };
};
