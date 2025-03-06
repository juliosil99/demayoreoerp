
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
};

export function useExpenseDelete() {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleDelete = async (expense: Expense) => {
    setDeleteError(null);
    try {
      console.log("Intentando eliminar gasto con ID:", expense.id);
      
      // First check if there are accounting adjustments
      const { data: adjustments, error: checkError } = await supabase
        .from('accounting_adjustments')
        .select('id')
        .eq('expense_id', expense.id);
        
      if (checkError) {
        console.error("Error al verificar ajustes contables:", checkError);
        throw checkError;
      }
      
      // Delete each adjustment individually to ensure they're all removed
      if (adjustments && adjustments.length > 0) {
        for (const adjustment of adjustments) {
          const { error: adjDeleteError } = await supabase
            .from('accounting_adjustments')
            .delete()
            .eq('id', adjustment.id);
            
          if (adjDeleteError) {
            console.error(`Error al eliminar ajuste ${adjustment.id}:`, adjDeleteError);
            setDeleteError(`Error al eliminar ajuste contable: ${adjDeleteError.message}`);
            toast.error(`Error al eliminar ajuste contable: ${adjDeleteError.message}`);
            throw adjDeleteError;
          }
        }
      }
      
      // Delete invoice relations
      const { error: relationsError } = await supabase
        .from('expense_invoice_relations')
        .delete()
        .eq('expense_id', expense.id);
      
      if (relationsError) {
        console.error("Error al eliminar relaciones con facturas:", relationsError);
        // Continue despite this error, as there might not be any relations
      }

      // Finally delete the expense
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id);

      if (error) {
        console.error("Error detallado al eliminar gasto:", error);
        
        // Determine the type of error to show a more specific message
        if (error.code === '23503') {
          setDeleteError(`Error al eliminar: ${error.message}`);
          toast.error("No se pudo eliminar el gasto, podría estar vinculado a otros registros");
        } else {
          setDeleteError(`Error al eliminar: ${error.message}`);
          toast.error(`Error al eliminar el gasto: ${error.message}`);
        }
        throw error;
      }

      console.log("Gasto eliminado exitosamente:", expense.id);
      toast.success('Gasto eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    } catch (error) {
      console.error('Error completo al eliminar gasto:', error);
    }
  };

  return {
    deleteError,
    handleDelete
  };
}
