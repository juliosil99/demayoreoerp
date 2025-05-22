
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { markPayableAsPaid } from "./services/payableService";

export function useMarkPayableAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markPayableAsPaid,
    onSuccess: (hasInvoice) => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      if (hasInvoice) {
        toast.success("Cuenta por pagar marcada como pagada y gasto creado con conciliación automática");
      } else {
        toast.success("Cuenta por pagar marcada como pagada y gasto creado");
      }
    },
    onError: (error) => {
      console.error('Error marking payable as paid:', error);
      toast.error("Error al marcar como pagada: " + (error as Error).message);
    },
  });
}
