
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  const { mutate: deleteInvitation, isPending: isDeleting } = useMutation({
    mutationFn: async (invitationId: string) => {
      console.log("Deleting invitation:", invitationId);
      
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        console.error("Error deleting invitation:", error);
        throw error;
      }

      return invitationId;
    },
    onSuccess: (deletedId) => {
      console.log("Successfully deleted invitation:", deletedId);
      // Invalidate and refetch invitations to update the UI
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitación eliminada exitosamente");
    },
    onError: (error: any) => {
      console.error("Error deleting invitation:", error);
      toast.error(`Error al eliminar la invitación: ${error.message}`);
    },
  });

  return {
    deleteInvitation,
    isDeleting
  };
}
