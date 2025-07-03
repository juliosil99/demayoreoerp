import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentMatch {
  paymentId: string;
  groupId: string;
  amountDifference: number;
  isCompatible: boolean;
}

interface AutoReconciliationGroup {
  id: string;
  date: string;
  paymentMethod: string;
  channel: string;
  channelType: string;
  sales: any[];
  totalAmount: number;
  status: 'perfect' | 'minor_discrepancy' | 'major_discrepancy';
  discrepancyAmount?: number;
  validationErrors: string[];
}

export function useManualAutoReconciliation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const processManualReconciliation = useMutation({
    mutationFn: async ({ matches, groups }: { matches: PaymentMatch[], groups: AutoReconciliationGroup[] }) => {
      console.log("🔄 [MANUAL-AUTO-RECONCILIATION] Starting manual reconciliation process...");
      console.log("📊 [MANUAL-AUTO-RECONCILIATION] Processing", matches.length, "matches");

      const results = {
        successCount: 0,
        errorCount: 0,
        errors: [] as Array<{ matchId: string; error: string }>
      };

      for (const match of matches) {
        try {
          const group = groups.find(g => g.id === match.groupId);
          if (!group) {
            throw new Error(`Group ${match.groupId} not found`);
          }

          console.log("🔍 [MANUAL-AUTO-RECONCILIATION] Processing match:", {
            paymentId: match.paymentId,
            groupId: match.groupId,
            salesCount: group.sales.length,
            totalAmount: group.totalAmount
          });

          // Update sales with reconciliation to the selected payment
          const salesIds = group.sales.map(sale => sale.id);
          console.log("📝 [MANUAL-AUTO-RECONCILIATION] Updating sales with IDs:", salesIds);

          const { error: salesError } = await supabase
            .from("Sales")
            .update({
              reconciliation_id: match.paymentId,
              statusPaid: 'cobrado',
              datePaid: group.date
            })
            .in("id", salesIds);

          if (salesError) {
            throw new Error(`Error updating sales: ${salesError.message}`);
          }

          // Update payment reconciliation status
          const { error: paymentUpdateError } = await supabase
            .from("payments")
            .update({
              is_reconciled: true,
              reconciled_amount: group.totalAmount,
              reconciled_count: group.sales.length
            })
            .eq("id", match.paymentId);

          if (paymentUpdateError) {
            throw new Error(`Error updating payment: ${paymentUpdateError.message}`);
          }

          console.log("✅ [MANUAL-AUTO-RECONCILIATION] Successfully reconciled payment:", match.paymentId);
          results.successCount++;

        } catch (error) {
          console.error(`❌ [MANUAL-AUTO-RECONCILIATION] Error processing match ${match.paymentId}:`, error);
          results.errorCount++;
          results.errors.push({
            matchId: `${match.paymentId}-${match.groupId}`,
            error: error instanceof Error ? error.message : "Error desconocido"
          });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      console.log("🎉 [MANUAL-AUTO-RECONCILIATION] Process completed:", results);
      
      if (results.successCount > 0) {
        toast({
          title: "Reconciliación Manual Completada",
          description: `${results.successCount} reconciliaciones procesadas exitosamente.${results.errorCount > 0 ? ` ${results.errorCount} errores.` : ''}`,
        });
      }

      if (results.errorCount > 0 && results.successCount === 0) {
        toast({
          title: "Error en Reconciliación Manual",
          description: `No se pudo completar ninguna reconciliación. ${results.errorCount} errores.`,
          variant: "destructive",
        });
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["optimized-payments-reconciliation"] });
      queryClient.invalidateQueries({ queryKey: ["optimized-unreconciled-sales"] });
      queryClient.invalidateQueries({ queryKey: ["optimized-payments"] });
    },
    onError: (error) => {
      console.error("❌ [MANUAL-AUTO-RECONCILIATION] Mutation failed:", error);
      toast({
        title: "Error en Reconciliación Manual",
        description: "No se pudo completar el proceso de reconciliación manual.",
        variant: "destructive",
      });
    },
  });

  return {
    processManualReconciliation: processManualReconciliation.mutate,
    isProcessing: processManualReconciliation.isPending,
  };
}