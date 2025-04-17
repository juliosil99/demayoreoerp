
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
  const [deleteLog, setDeleteLog] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const handleDelete = async (expense: Expense) => {
    setDeleteError(null);
    const log: string[] = [`Iniciando eliminación del gasto ID: ${expense.id}`];
    setDeleteLog(log);
    
    try {
      // We'll directly delete the expense and rely on the database trigger to handle dependencies
      // This is more reliable as the cascade happens at the database level
      log.push("Intentando eliminar el gasto directamente...");
      log.push("El trigger de la base de datos se encargará de eliminar los ajustes contables asociados");
      setDeleteLog([...log]);
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id);

      if (error) {
        log.push(`Error al eliminar gasto: ${error.message}`);
        log.push(`Código: ${error.code}`);
        log.push(`Detalles: ${JSON.stringify(error)}`);
        setDeleteLog([...log]);
        
        setDeleteError(`Error al eliminar: ${error.message}`);
        toast.error("No se pudo eliminar el gasto: " + error.message);
        
        return {
          success: false,
          log: log
        };
      }

      log.push("Gasto eliminado exitosamente");
      setDeleteLog([...log]);
      
      toast.success('Gasto eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      
      return {
        success: true,
        log: log
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.push(`Error no controlado: ${errorMessage}`);
      log.push(`Error completo: ${JSON.stringify(error)}`);
      setDeleteLog([...log]);
      console.error('Log completo de eliminación:', log);
      
      return {
        success: false,
        log: log
      };
    }
  };

  return {
    deleteError,
    handleDelete,
    deleteLog
  };
}
