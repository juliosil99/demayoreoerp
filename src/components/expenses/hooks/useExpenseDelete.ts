
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
      
      // Step 1: First delete associated accounting adjustments
      const { error: adjustmentsError } = await supabase
        .from('accounting_adjustments')
        .delete()
        .eq('expense_id', expense.id);
      
      if (adjustmentsError) {
        console.error("Error al eliminar ajustes contables:", adjustmentsError);
        setDeleteError(`Error al eliminar ajustes contables: ${adjustmentsError.message}`);
        toast.error(`Error al eliminar ajustes: ${adjustmentsError.message}`);
        throw adjustmentsError;
      }
      
      // Step 2: Delete expense invoice relations if any
      const { error: relationsError } = await supabase
        .from('expense_invoice_relations')
        .delete()
        .eq('expense_id', expense.id);
      
      if (relationsError) {
        console.error("Error al eliminar relaciones:", relationsError);
        // Continue anyway as there might not be any relations
      }
      
      // Step 3: Now we can delete the expense itself
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id);

      if (error) {
        console.error("Error detallado al eliminar gasto:", error);
        setDeleteError(`Error al eliminar: ${error.message}`);
        toast.error("No se pudo eliminar el gasto: " + error.message);
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
