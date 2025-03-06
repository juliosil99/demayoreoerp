
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
      
      // Now we can directly delete the expense
      // The database trigger will handle deleting the related records
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
