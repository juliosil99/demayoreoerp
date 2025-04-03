
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useDeletePayable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payableId: string) => {
      const { error } = await supabase
        .from("accounts_payable")
        .delete()
        .eq("id", payableId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      toast({
        title: "Cuenta por pagar eliminada",
        description: "La cuenta por pagar ha sido eliminada correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar la cuenta por pagar.",
        variant: "destructive",
      });
    },
  });
}
