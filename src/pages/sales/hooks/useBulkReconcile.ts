
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BulkReconcileParams {
  salesIds: number[];
  paymentId: string;
}

export function useBulkReconcile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ salesIds, paymentId }: BulkReconcileParams) => {
      if (!user) throw new Error("User not authenticated");

      // Update all the sales records with the payment reference
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('date')
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;

      const { error: salesError } = await supabase
        .from('Sales')
        .update({ 
          reconciliation_id: paymentId,
          statusPaid: 'cobrado',
          datePaid: payment.date
        })
        .in('id', salesIds);

      if (salesError) throw salesError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["unreconciled"] });
      toast.success("Ventas reconciliadas exitosamente");
    },
    onError: (error) => {
      console.error("Error en reconciliación:", error);
      toast.error("Error al reconciliar las ventas");
    }
  });
}
