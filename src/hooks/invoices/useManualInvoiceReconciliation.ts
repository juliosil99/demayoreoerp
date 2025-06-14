
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useManualInvoiceReconciliation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const markAsReconciled = async (
    invoiceId: number,
    notes?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('invoices')
        .update({
          manually_reconciled: true,
          manual_reconciliation_date: new Date().toISOString(),
          manual_reconciliation_notes: notes || null
        })
        .eq('id', invoiceId);

      if (error) {
        console.error('Error marking invoice as reconciled:', error);
        toast.error('Error al marcar la factura como reconciliada');
        return false;
      }

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['optimized-invoices'] });
      
      toast.success('Factura marcada como reconciliada manualmente');
      return true;
    } catch (error) {
      console.error('Error marking invoice as reconciled:', error);
      toast.error('Error al marcar la factura como reconciliada');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unmarkAsReconciled = async (invoiceId: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('invoices')
        .update({
          manually_reconciled: false,
          manual_reconciliation_date: null,
          manual_reconciliation_notes: null
        })
        .eq('id', invoiceId);

      if (error) {
        console.error('Error unmarking invoice as reconciled:', error);
        toast.error('Error al desmarcar la factura');
        return false;
      }

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['optimized-invoices'] });
      
      toast.success('Marca de reconciliación manual removida');
      return true;
    } catch (error) {
      console.error('Error unmarking invoice as reconciled:', error);
      toast.error('Error al desmarcar la factura');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    markAsReconciled,
    unmarkAsReconciled,
    isLoading
  };
};
