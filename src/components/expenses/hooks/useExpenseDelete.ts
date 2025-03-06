
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
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id);

      if (error) {
        console.error("Error detallado al eliminar gasto:", error);
        
        // Determinar el tipo de error para mostrar un mensaje más específico
        if (error.code === '23503' && error.details?.includes('accounting_adjustments')) {
          setDeleteError("No se puede eliminar este gasto porque está vinculado a ajustes contables. Debes eliminar primero los ajustes asociados.");
          toast.error("Este gasto está vinculado a ajustes contables y no puede ser eliminado directamente");
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
