
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

      console.log("=== RECONCILIATION DEBUG START ===");
      console.log(`Reconciling ${salesIds.length} sales with payment ID: ${paymentId}`);
      
      try {
        // Get payment details first for logging and verification
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('date, amount, is_reconciled')
          .eq('id', paymentId)
          .single();

        if (paymentError) {
          console.error("Error fetching payment:", paymentError);
          throw paymentError;
        }

        console.log("Payment before reconciliation:", payment);
        
        // Verify the sales records exist before updating them
        const { data: salesBefore, error: salesBeforeError } = await supabase
          .from('Sales')
          .select('id, price, statusPaid')
          .in('id', salesIds);

        if (salesBeforeError) {
          console.error("Error fetching sales records:", salesBeforeError);
          throw salesBeforeError;
        }

        console.log("Sales records before update:", salesBefore);
        
        // Check if any sales are already reconciled
        const alreadyReconciled = salesBefore?.filter(sale => sale.statusPaid === 'cobrado');
        if (alreadyReconciled && alreadyReconciled.length > 0) {
          console.log("WARNING: Some sales are already marked as reconciled:", alreadyReconciled);
        }

        // Update all the sales records with the payment reference
        console.log("Updating sales with reconciliation_id:", paymentId);
        const { data: updateResult, error: salesError } = await supabase
          .from('Sales')
          .update({ 
            reconciliation_id: paymentId,
            statusPaid: 'cobrado',
            datePaid: payment.date
          })
          .in('id', salesIds);

        if (salesError) {
          console.error("Error updating sales records:", salesError);
          throw salesError;
        }
        
        console.log("Sales update result:", updateResult);
        
        // Verify the sales records were updated successfully
        const { data: salesAfter, error: salesAfterError } = await supabase
          .from('Sales')
          .select('id, price, statusPaid, reconciliation_id, datePaid')
          .in('id', salesIds);

        if (salesAfterError) {
          console.error("Error fetching updated sales records:", salesAfterError);
          throw salesAfterError;
        }

        console.log("Sales records after update:", salesAfter);
        
        // Check if all sales have the correct reconciliation_id
        const correctlyReconciled = salesAfter?.filter(sale => sale.reconciliation_id === paymentId);
        console.log(`${correctlyReconciled?.length} of ${salesIds.length} sales correctly reconciled`);
        
        // Calculate the total amount and count of reconciled sales directly
        const { data: salesData, error: salesDataError } = await supabase
          .from('Sales')
          .select('price')
          .eq('reconciliation_id', paymentId);

        if (salesDataError) {
          console.error("Error calculating reconciled totals:", salesDataError);
          throw salesDataError;
        }

        const totalAmount = salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
        const salesCount = salesData?.length || 0;
        
        console.log(`Calculated reconciled amount: ${totalAmount}, count: ${salesCount}`);
        
        // Update the payment record to mark it as reconciled
        console.log("Updating payment record with reconciliation data:");
        console.log({
          is_reconciled: true,
          reconciled_amount: totalAmount,
          reconciled_count: salesCount
        });
        
        const { data: updatedPayment, error: updateError } = await supabase
          .from('payments')
          .update({
            is_reconciled: true,
            reconciled_amount: totalAmount,
            reconciled_count: salesCount
          })
          .eq('id', paymentId)
          .select();

        if (updateError) {
          console.error("Error updating payment record:", updateError);
          throw updateError;
        }
        
        console.log("Updated payment record:", updatedPayment);

        // Final verification - check if triggers might have run by getting latest payment data
        const { data: finalPayment, error: finalPaymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('id', paymentId)
          .single();
          
        if (finalPaymentError) {
          console.error("Error fetching final payment state:", finalPaymentError);
        } else {
          console.log("Final payment state after all operations:", finalPayment);
        }

        // Check if database triggers exist
        const { data: triggers, error: triggersError } = await supabase
          .rpc('list_triggers_for_table', { table_name: 'Sales' });
          
        if (triggersError) {
          console.log("Error checking triggers:", triggersError);
        } else {
          console.log("Triggers on Sales table:", triggers);
        }
        
        console.log("=== RECONCILIATION DEBUG END ===");
        
        return { 
          success: true,
          reconciled_amount: totalAmount,
          reconciled_count: salesCount
        };
      } catch (error) {
        console.error("=== RECONCILIATION ERROR ===", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["unreconciled"] });
      toast.success(`Ventas reconciliadas exitosamente: ${data.reconciled_count} ventas por ${data.reconciled_amount}`);
    },
    onError: (error) => {
      console.error("Error en reconciliación:", error);
      toast.error("Error al reconciliar las ventas");
    }
  });
}
