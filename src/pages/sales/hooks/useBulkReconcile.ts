
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

      console.log("=== INICIANDO RECONCILIACIÓN MASIVA ===");
      console.log(`Reconciliando ${salesIds.length} ventas con pago ID: ${paymentId}`);
      
      try {
        // 1. Obtener detalles del pago
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('date, amount, is_reconciled')
          .eq('id', paymentId)
          .single();

        if (paymentError) {
          console.error("Error obteniendo pago:", paymentError);
          throw paymentError;
        }

        console.log("Pago antes de reconciliación:", payment);
        
        // 2. Verificar ventas antes de la actualización
        const { data: salesBefore, error: salesBeforeError } = await supabase
          .from('Sales')
          .select('id, price, statusPaid, reconciliation_id')
          .in('id', salesIds);

        if (salesBeforeError) {
          console.error("Error obteniendo ventas:", salesBeforeError);
          throw salesBeforeError;
        }

        console.log("Ventas antes de actualizar:", salesBefore);
        
        // 3. ACTUALIZAR SALES: reconciliation_id, statusPaid, datePaid
        console.log("Actualizando ventas con reconciliation_id:", paymentId);
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
          console.error("Error actualizando ventas:", salesError);
          throw salesError;
        }
        
        console.log("Resultado actualización ventas:", salesUpdateResult);
        
        // 4. Verificar que las ventas se actualizaron correctamente
        const { data: salesAfter, error: salesAfterError } = await supabase
          .from('Sales')
          .select('id, price, statusPaid, reconciliation_id, datePaid')
          .in('id', salesIds);

        if (salesAfterError) {
          console.error("Error verificando ventas actualizadas:", salesAfterError);
          throw salesAfterError;
        }

        console.log("Ventas después de actualizar:", salesAfter);
        
        // 5. Calcular totales para el pago
        const totalAmount = salesAfter?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
        const salesCount = salesAfter?.length || 0;
        
        console.log(`Totales calculados: ${totalAmount} (${salesCount} ventas)`);
        
        // 6. ACTUALIZAR PAYMENTS: is_reconciled, reconciled_amount, reconciled_count
        console.log("Actualizando pago con datos de reconciliación:");
        const paymentUpdateData = {
          is_reconciled: true,
          reconciled_amount: totalAmount,
          reconciled_count: salesCount
        };
        console.log("Datos a actualizar en pago:", paymentUpdateData);
        
        const { data: updatedPayment, error: updateError } = await supabase
          .from('payments')
          .update(paymentUpdateData)
          .eq('id', paymentId)
          .select('id, is_reconciled, reconciled_amount, reconciled_count');

        if (updateError) {
          console.error("Error actualizando pago:", updateError);
          throw updateError;
        }
        
        console.log("Pago actualizado:", updatedPayment);

        // 7. Verificación final
        const { data: finalPayment, error: finalPaymentError } = await supabase
          .from('payments')
          .select('id, is_reconciled, reconciled_amount, reconciled_count')
          .eq('id', paymentId)
          .single();
          
        if (finalPaymentError) {
          console.error("Error en verificación final del pago:", finalPaymentError);
        } else {
          console.log("Estado final del pago:", finalPayment);
        }

        // 8. Verificar ventas finales
        const { data: finalSales, error: finalSalesError } = await supabase
          .from('Sales')
          .select('id, statusPaid, reconciliation_id, datePaid')
          .in('id', salesIds);
          
        if (finalSalesError) {
          console.error("Error en verificación final de ventas:", finalSalesError);
        } else {
          console.log("Estado final de ventas:", finalSales);
        }
        
        console.log("=== RECONCILIACIÓN COMPLETADA EXITOSAMENTE ===");
        
        return { 
          success: true,
          reconciled_amount: totalAmount,
          reconciled_count: salesCount,
          updated_sales: salesAfter,
          updated_payment: updatedPayment
        };
      } catch (error) {
        console.error("=== ERROR EN RECONCILIACIÓN ===", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Mutation onSuccess - Invalidando consultas y mostrando toast");
      
      // Invalidar todas las consultas relacionadas
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["unreconciled"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      
      toast.success(
        `Reconciliación exitosa: ${data.reconciled_count} ventas por $${data.reconciled_amount.toLocaleString()}`
      );
      
      console.log("Reconciliación completada:", {
        ventas_actualizadas: data.updated_sales?.length,
        pago_actualizado: data.updated_payment?.[0]?.id,
        monto_total: data.reconciled_amount,
        cantidad_ventas: data.reconciled_count
      });
    },
    onError: (error) => {
      console.error("Error en mutation de reconciliación:", error);
      toast.error("Error al reconciliar las ventas. Revisa la consola para más detalles.");
    }
  });
}
