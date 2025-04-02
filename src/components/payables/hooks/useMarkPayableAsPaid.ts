
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useMarkPayableAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payableId: string) => {
      const { data: payable, error: fetchError } = await supabase
        .from('accounts_payable')
        .select('invoice_id')
        .eq('id', payableId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('accounts_payable')
        .update({ status: 'paid' })
        .eq('id', payableId);

      if (error) throw error;
      
      return !!payable.invoice_id;
    },
    onSuccess: (hasInvoice) => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      if (hasInvoice) {
        toast.success("Cuenta por pagar marcada como pagada y gasto creado con conciliación automática");
      } else {
        toast.success("Cuenta por pagar marcada como pagada y gasto creado");
      }
    },
    onError: (error) => {
      console.error('Error marking payable as paid:', error);
      toast.error("Error al marcar como pagada");
    },
  });
}
