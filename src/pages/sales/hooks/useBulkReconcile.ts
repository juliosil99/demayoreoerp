
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BulkReconcileParams {
  salesIds: number[];
  paymentData: {
    date: string;
    amount: number;
    account_id: number;
    payment_method: string;
    reference_number?: string;
    sales_channel_id?: string;
  };
}

export function useBulkReconcile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ salesIds, paymentData }: BulkReconcileParams) => {
      if (!user) throw new Error("User not authenticated");

      // First create the payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          ...paymentData,
          user_id: user.id,
          status: 'completed'
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Then update all the sales records with the payment reference
      const { error: salesError } = await supabase
        .from('Sales')
        .update({ 
          reconciliation_id: payment.id,
          statusPaid: 'cobrado',
          datePaid: paymentData.date
        })
        .in('id', salesIds);

      if (salesError) throw salesError;

      return payment;
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
