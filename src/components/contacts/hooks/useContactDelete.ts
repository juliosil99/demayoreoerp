
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useContactDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        // Check expenses references
        const { data: expenses, error: expensesError } = await supabase
          .from("expenses")
          .select("id")
          .eq("supplier_id", id)
          .limit(1);
        
        if (expensesError) throw expensesError;
        if (expenses?.length > 0) {
          throw new Error("Este contacto no puede ser eliminado porque está referenciado en gastos.");
        }

        // Check client payments references
        const { data: clientPayments, error: clientError } = await supabase
          .from("payments")
          .select("id")
          .eq("client_id", id)
          .limit(1);
        
        if (clientError) throw clientError;
        if (clientPayments?.length > 0) {
          throw new Error("Este contacto no puede ser eliminado porque está referenciado en pagos como cliente.");
        }

        // Delete the contact
        const { error: deleteError } = await supabase
          .from("contacts")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Error al eliminar el contacto");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contacto eliminado exitosamente");
    },
    onError: (error) => {
      console.error("Error al eliminar contacto:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al eliminar contacto");
      }
    },
  });
};
