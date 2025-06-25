
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { markPayableAsPaid } from "./services/payableService";

/**
 * Hook for marking a payable as paid
 * Creates an expense record and updates the payable status
 */
export function useMarkPayableAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markPayableAsPaid,
    onMutate: async (payableId) => {
      // Cancel any outgoing refetches to avoid race conditions
      await queryClient.cancelQueries({ queryKey: ["payables"] });
      await queryClient.cancelQueries({ queryKey: ["expenses"] });
      
      console.log('🔄 Starting payable payment mutation for:', payableId);
    },
    onSuccess: (hasInvoice, payableId) => {
      console.log('✅ Payable payment mutation successful:', { payableId, hasInvoice });
      
      // Invalidate related queries with specific timing to prevent race conditions
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["payables"] });
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        queryClient.invalidateQueries({ queryKey: ["optimized-expenses"] });
      }, 500);
      
      if (hasInvoice) {
        toast.success("Cuenta por pagar marcada como pagada y gasto creado con conciliación automática");
      } else {
        toast.success("Cuenta por pagar marcada como pagada y gasto creado");
      }
    },
    onError: (error, payableId) => {
      console.error('❌ Error marking payable as paid:', { payableId, error });
      toast.error("Error al marcar como pagada: " + (error as Error).message);
      
      // Refetch data to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["payables"] });
    },
    onSettled: () => {
      console.log('🏁 Payable payment mutation settled');
    },
  });
}
