
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function usePaymentStatusUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string; 
      status: 'confirmed' | 'pending' 
    }) => {
      const { data, error } = await supabase
        .from('payments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["optimized-payments"] });
      queryClient.invalidateQueries({ queryKey: ["optimized-payments-reconciliation"] });
      
      const statusText = variables.status === 'confirmed' ? 'confirmado' : 'marcado como pendiente';
      toast({
        title: "Estado actualizado",
        description: `El pago ha sido ${statusText} exitosamente.`,
      });
    },
    onError: (error) => {
      console.error("Error actualizando estado del pago:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pago.",
        variant: "destructive",
      });
    },
  });
}
