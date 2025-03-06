
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
      // Check if the expense has accounting adjustments
      const { data: adjustments, error: checkError } = await supabase
        .from('accounting_adjustments')
        .select('id')
        .eq('expense_id', expense.id);
      
      log.push(`Verificando ajustes contables: ${adjustments ? adjustments.length : 0} encontrados`);
      setDeleteLog([...log]);
      
      if (checkError) {
        log.push(`Error al verificar ajustes: ${checkError.message}`);
        setDeleteLog([...log]);
        throw checkError;
      }

      // Step 1: Delete associated accounting adjustments
      log.push("Intentando eliminar ajustes contables asociados...");
      setDeleteLog([...log]);
      
      const { error: adjustmentsError } = await supabase
        .from('accounting_adjustments')
        .delete()
        .eq('expense_id', expense.id);
      
      if (adjustmentsError) {
        log.push(`Error al eliminar ajustes contables: ${adjustmentsError.message}`);
        log.push(`Detalles: ${JSON.stringify(adjustmentsError)}`);
        setDeleteLog([...log]);
        setDeleteError(`Error al eliminar ajustes contables: ${adjustmentsError.message}`);
        toast.error(`Error al eliminar ajustes: ${adjustmentsError.message}`);
        throw adjustmentsError;
      }
      
      log.push("Ajustes contables eliminados exitosamente");
      setDeleteLog([...log]);
      
      // Step 2: Check and delete expense invoice relations if any
      const { data: relations, error: checkRelationsError } = await supabase
        .from('expense_invoice_relations')
        .select('id')
        .eq('expense_id', expense.id);
      
      log.push(`Verificando relaciones de facturas: ${relations ? relations.length : 0} encontradas`);
      setDeleteLog([...log]);
      
      if (checkRelationsError) {
        log.push(`Error al verificar relaciones: ${checkRelationsError.message}`);
        setDeleteLog([...log]);
      }
      
      if (relations && relations.length > 0) {
        log.push("Intentando eliminar relaciones de facturas...");
        setDeleteLog([...log]);
        
        const { error: relationsError } = await supabase
          .from('expense_invoice_relations')
          .delete()
          .eq('expense_id', expense.id);
        
        if (relationsError) {
          log.push(`Error al eliminar relaciones: ${relationsError.message}`);
          log.push(`Detalles: ${JSON.stringify(relationsError)}`);
          setDeleteLog([...log]);
          // Continue anyway as this might not be critical
        } else {
          log.push("Relaciones de facturas eliminadas exitosamente");
          setDeleteLog([...log]);
        }
      }
      
      // Step 3: Now try to delete the expense itself
      log.push("Intentando eliminar el gasto...");
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
        throw error;
      }

      log.push("Gasto eliminado exitosamente");
      setDeleteLog([...log]);
      
      toast.success('Gasto eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    } catch (error) {
      log.push(`Error completo: ${JSON.stringify(error)}`);
      setDeleteLog([...log]);
      console.error('Log completo de eliminación:', log);
    }
    
    // Return the log for debugging
    return {
      success: deleteError === null,
      log: deleteLog
    };
  };

  return {
    deleteError,
    handleDelete,
    deleteLog
  };
}
