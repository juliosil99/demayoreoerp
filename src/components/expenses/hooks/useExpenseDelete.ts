
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
      
      // Primero eliminamos los ajustes contables asociados
      const { error: adjustmentsError } = await supabase
        .from('accounting_adjustments')
        .delete()
        .eq('expense_id', expense.id);
      
      if (adjustmentsError) {
        console.error("Error al eliminar ajustes contables:", adjustmentsError);
        setDeleteError(`Error al eliminar ajustes contables: ${adjustmentsError.message}`);
        toast.error(`Error al eliminar ajustes contables: ${adjustmentsError.message}`);
        throw adjustmentsError;
      }
      
      // Luego eliminamos las relaciones con facturas si existen
      const { error: relationsError } = await supabase
        .from('expense_invoice_relations')
        .delete()
        .eq('expense_id', expense.id);
      
      if (relationsError) {
        console.error("Error al eliminar relaciones con facturas:", relationsError);
        // Continuamos a pesar de este error, ya que podría no haber relaciones
      }

      // Finalmente eliminamos el gasto
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id);

      if (error) {
        console.error("Error detallado al eliminar gasto:", error);
        
        // Determinar el tipo de error para mostrar un mensaje más específico
        if (error.code === '23503') {
          setDeleteError("Error al eliminar: Este gasto podría estar vinculado a otros registros en el sistema.");
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
