import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentAdjustment {
  id: string;
  type: 'commission' | 'shipping' | 'other';
  amount: number;
  description: string;
}

export function usePaymentReconciliation() {
  const [selectedSales, setSelectedSales] = useState<number[]>([]);
  const [adjustments, setAdjustments] = useState<PaymentAdjustment[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addAdjustment = useCallback((adjustment: Omit<PaymentAdjustment, 'id'>) => {
    const newAdjustment: PaymentAdjustment = {
      ...adjustment,
      id: crypto.randomUUID()
    };
    setAdjustments(prev => [...prev, newAdjustment]);
  }, []);

  const removeAdjustment = useCallback((id: string) => {
    setAdjustments(prev => prev.filter(adj => adj.id !== id));
  }, []);

  const resetReconciliation = useCallback(() => {
    setSelectedSales([]);
    setAdjustments([]);
  }, []);

  const reconcilePaymentMutation = useMutation({
    mutationFn: async ({ salesIds, paymentId }: { salesIds: number[], paymentId: string }) => {
      console.log("Starting payment reconciliation:", { salesIds, paymentId, adjustments });

      // Start a transaction-like operation
      const { error: salesError } = await supabase
        .from("Sales")
        .update({ reconciliation_id: paymentId })
        .in("id", salesIds);

      if (salesError) {
        console.error("Error updating sales:", salesError);
        throw salesError;
      }

      // Save payment adjustments if any
      if (adjustments.length > 0) {
        const { data: userData } = await supabase.auth.getUser();
        const adjustmentData = adjustments.map(adj => ({
          payment_id: paymentId,
          adjustment_type: adj.type,
          amount: adj.amount,
          description: adj.description,
          user_id: userData.user?.id
        }));

        const { error: adjustmentError } = await supabase
          .from("payment_adjustments")
          .insert(adjustmentData);

        if (adjustmentError) {
          console.error("Error saving adjustments:", adjustmentError);
          // Rollback sales update if adjustments fail
          await supabase
            .from("Sales")
            .update({ reconciliation_id: null })
            .in("id", salesIds);
          throw adjustmentError;
        }
      }

      // Calculate totals for payment update
      const { data: salesData } = await supabase
        .from("Sales")
        .select("price")
        .in("id", salesIds);

      const salesTotal = salesData?.reduce((sum, sale) => sum + (sale.price || 0), 0) || 0;
      const adjustmentsTotal = adjustments.reduce((sum, adj) => sum + adj.amount, 0);
      const finalTotal = salesTotal + adjustmentsTotal;

      // Update payment with reconciliation data
      const { error: paymentError } = await supabase
        .from("payments")
        .update({
          is_reconciled: true,
          reconciled_amount: finalTotal,
          reconciled_count: salesIds.length
        })
        .eq("id", paymentId);

      if (paymentError) {
        console.error("Error updating payment:", paymentError);
        throw paymentError;
      }

      console.log("Payment reconciliation completed successfully");
      return { salesIds, paymentId, finalTotal };
    },
    onSuccess: () => {
      toast({
        title: "Reconciliación Exitosa",
        description: "El pago ha sido reconciliado correctamente con las ventas seleccionadas.",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["payments-for-reconciliation"] });
      queryClient.invalidateQueries({ queryKey: ["unreconciled"] });
      queryClient.invalidateQueries({ queryKey: ["paymentsData"] });
      
      // Reset state
      resetReconciliation();
    },
    onError: (error) => {
      console.error("Payment reconciliation failed:", error);
      toast({
        title: "Error en la Reconciliación",
        description: "No se pudo completar la reconciliación. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  return {
    selectedSales,
    setSelectedSales,
    adjustments,
    addAdjustment,
    removeAdjustment,
    resetReconciliation,
    reconcilePayment: reconcilePaymentMutation.mutate,
    isReconciling: reconcilePaymentMutation.isPending
  };
}