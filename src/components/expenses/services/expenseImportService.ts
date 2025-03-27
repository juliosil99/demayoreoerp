
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const importExpenses = async (
  expenses: any[],
  userId: string,
  fileName: string,
  onProgress?: (successCount: number) => void
) => {
  console.log("Starting import process with", expenses.length, "expenses");
  console.log("Sample expense data:", expenses[0]);
  
  let successCount = 0;
  let errorCount = 0;
  let errors: string[] = [];

  try {
    // Create import record
    console.log("Creating import record for file:", fileName);
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
      console.error('Error creating import record:', importError);
      toast.error('Error al registrar la importación');
      return { successCount: 0, errorCount: 0, errors: [importError.message] };
    }

    console.log("Import record created:", importRecord);

    for (let i = 0; i < expenses.length; i++) {
      const expenseData = expenses[i];
      try {
        console.log(`Processing expense ${i+1}/${expenses.length}:`, {
          description: expenseData.description,
          amount: expenseData.amount,
          date: expenseData.date,
          account_id: expenseData.account_id
        });
        
        // Validate required fields
        if (!expenseData.date || !expenseData.description || !expenseData.amount || !expenseData.account_id || !expenseData.chart_account_id) {
          const missingFields = [];
          if (!expenseData.date) missingFields.push('fecha');
          if (!expenseData.description) missingFields.push('descripción');
          if (!expenseData.amount) missingFields.push('monto');
          if (!expenseData.account_id) missingFields.push('ID cuenta');
          if (!expenseData.chart_account_id) missingFields.push('ID cuenta contable');
          
          const errorMsg = `Fila ${i+1}: Campos requeridos faltantes: ${missingFields.join(', ')}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          errorCount++;
          continue;
        }

        // Format data for insert
        const formattedExpense = {
          ...expenseData,
          user_id: userId,
          amount: parseFloat(expenseData.amount.toString()),
          account_id: parseInt(expenseData.account_id.toString())
        };

        console.log("Formatted expense data:", formattedExpense);

        const { error } = await supabase
          .from('expenses')
          .insert(formattedExpense);

        if (error) {
          console.error(`Error importing expense ${i+1}:`, error);
          errors.push(`Fila ${i+1}: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
          console.log(`Expense ${i+1} imported successfully`);
          
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
      } catch (error: any) {
        console.error(`Error processing expense ${i+1}:`, error);
        errors.push(`Fila ${i+1}: ${error.message || 'Error desconocido'}`);
        errorCount++;
      }
    }

    // Update final status
    if (importRecord) {
      const finalStatus = errorCount > 0 ? 'completed_with_errors' : 'completed';
      const errorMessage = errors.length > 0 ? errors.join('\n').substring(0, 1000) : null;
      
      await supabase
        .from('expense_imports')
        .update({ 
          status: finalStatus,
          processed_rows: successCount,
          error_message: errorMessage
        })
        .eq('id', importRecord.id);
      
      console.log("Import completed with status:", finalStatus);
    }
  } catch (error: any) {
    console.error('Unexpected error during import process:', error);
    errors.push(`Error general: ${error.message || 'Error desconocido'}`);
    errorCount++;
  }

  console.log("Import summary:", { successCount, errorCount, errors });
  return { successCount, errorCount, errors };
};
