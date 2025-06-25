
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { markPayableAsPaid } from "./services/payableService";
import { useState } from "react";

/**
 * Hook for marking a payable as paid
 * Enhanced with duplicate prevention and better UX
 */
export function useMarkPayableAsPaid() {
  const queryClient = useQueryClient();
  const [processedPayables, setProcessedPayables] = useState<Set<string>>(new Set());

  return useMutation({
    mutationFn: async (payableId: string) => {
      // Verificar si ya está siendo procesado
      if (processedPayables.has(payableId)) {
        console.warn('⚠️ Payable already being processed:', payableId);
        throw new Error("Esta cuenta por pagar ya está siendo procesada");
      }

      // Marcar como procesándose
      setProcessedPayables(prev => new Set(prev).add(payableId));
      
      try {
        return await markPayableAsPaid(payableId);
      } finally {
        // Remover del set después de un delay para evitar múltiples clicks rápidos
        setTimeout(() => {
          setProcessedPayables(prev => {
            const newSet = new Set(prev);
            newSet.delete(payableId);
            return newSet;
          });
        }, 2000);
      }
    },
    onMutate: async (payableId) => {
      // Cancel any outgoing refetches to avoid race conditions
      await queryClient.cancelQueries({ queryKey: ["payables"] });
      await queryClient.cancelQueries({ queryKey: ["expenses"] });
      
      console.log('🔄 Starting enhanced payable payment mutation for:', payableId);
    },
    onSuccess: (hasInvoice, payableId) => {
      console.log('✅ Enhanced payable payment mutation successful:', { payableId, hasInvoice });
      
      // Invalidate related queries with optimized timing
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["payables"] });
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        queryClient.invalidateQueries({ queryKey: ["optimized-expenses"] });
      }, 1000); // Increased delay to allow DB processing
      
      if (hasInvoice) {
        toast.success("Cuenta por pagar marcada como pagada y gasto creado con conciliación automática");
      } else {
        toast.success("Cuenta por pagar marcada como pagada y gasto creado");
      }
    },
    onError: (error, payableId) => {
      console.error('❌ Error marking payable as paid:', { payableId, error });
      
      // Remover inmediatamente del set en caso de error
      setProcessedPayables(prev => {
        const newSet = new Set(prev);
        newSet.delete(payableId);
        return newSet;
      });
      
      toast.error("Error al marcar como pagada: " + (error as Error).message);
      
      // Refetch data to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["payables"] });
    },
    onSettled: () => {
      console.log('🏁 Enhanced payable payment mutation settled');
    },
  });
}
