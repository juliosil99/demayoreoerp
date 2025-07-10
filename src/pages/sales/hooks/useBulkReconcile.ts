
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

      // Starting bulk reconciliation process
      
      try {
        // 1. Obtener detalles del pago
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('date, amount, is_reconciled')
          .eq('id', paymentId)
          .single();

        if (paymentError) {
          throw paymentError;
        }

        // Payment retrieved for reconciliation
        
        // 2. Verificar ventas antes de la actualización
        const { data: salesBefore, error: salesBeforeError } = await supabase
          .from('Sales')
          .select('id, price, statusPaid, reconciliation_id')
          .in('id', salesIds);

        if (salesBeforeError) {
          throw salesBeforeError;
        }
        
        // 3. ACTUALIZAR SALES: reconciliation_id, statusPaid, datePaid
        const { data: salesUpdateResult, error: salesError } = await supabase
          .from('Sales')
          .update({ 
            reconciliation_id: paymentId,
            statusPaid: 'cobrado',
            datePaid: payment.date
          })
          .in('id', salesIds)
          .select('id, price, statusPaid, reconciliation_id, datePaid');

        if (salesError) {
          throw salesError;
        }
        
        // 4. Verificar que las ventas se actualizaron correctamente
        const { data: salesAfter, error: salesAfterError } = await supabase
          .from('Sales')
          .select('id, price, statusPaid, reconciliation_id, datePaid')
          .in('id', salesIds);

        if (salesAfterError) {
          throw salesAfterError;
        }
        
        // 5. Obtener payment adjustments para este pago
        const { data: paymentAdjustments, error: adjustmentsError } = await supabase
          .from('payment_adjustments')
          .select('amount')
          .eq('payment_id', paymentId);

        if (adjustmentsError) {
          throw adjustmentsError;
        }

        // 6. Calcular totales para el pago (ventas - adjustments)
        const salesTotal = salesAfter?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
        const adjustmentsTotal = paymentAdjustments?.reduce((sum, adj) => sum + (adj.amount || 0), 0) || 0;
        const netAmount = salesTotal - adjustmentsTotal;
        
        // Redondear a 2 decimales para evitar problemas de precisión
        const totalAmount = Math.round(netAmount * 100) / 100;
        const salesCount = salesAfter?.length || 0;
        
        // 7. ACTUALIZAR PAYMENTS: is_reconciled, reconciled_amount, reconciled_count
        const paymentUpdateData = {
          is_reconciled: true,
          reconciled_amount: totalAmount,
          reconciled_count: salesCount
        };
        
        const { data: updatedPayment, error: updateError } = await supabase
          .from('payments')
          .update(paymentUpdateData)
          .eq('id', paymentId)
          .select('id, is_reconciled, reconciled_amount, reconciled_count');

        if (updateError) {
          throw updateError;
        }

        // 7. Verificación final
        const { data: finalPayment, error: finalPaymentError } = await supabase
          .from('payments')
          .select('id, is_reconciled, reconciled_amount, reconciled_count')
          .eq('id', paymentId)
          .single();
          
        if (finalPaymentError) {
          // Verification error logged
        }

        // 8. Verificar ventas finales
        const { data: finalSales, error: finalSalesError } = await supabase
          .from('Sales')
          .select('id, statusPaid, reconciliation_id, datePaid')
          .in('id', salesIds);
          
        if (finalSalesError) {
          // Verification error logged
        }
        
        // Reconciliation completed successfully
        
        return { 
          success: true,
          reconciled_amount: totalAmount,
          reconciled_count: salesCount,
          updated_sales: salesAfter,
          updated_payment: updatedPayment
        };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidar todas las consultas relacionadas
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["unreconciled"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      
      toast.success(
        `Reconciliación exitosa: ${data.reconciled_count} ventas por $${data.reconciled_amount.toLocaleString()}`
      );
    },
    onError: (error) => {
      toast.error("Error al reconciliar las ventas.");
    }
  });
}
