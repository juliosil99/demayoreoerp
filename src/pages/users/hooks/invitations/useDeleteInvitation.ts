
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  const { mutate: deleteInvitation, isPending: isDeleting } = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        throw error;
      }

      return invitationId;
    },
    onSuccess: () => {
      // Invalidate and refetch invitations to update the UI
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitación eliminada exitosamente");
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar la invitación: ${error.message}`);
    },
  });

  return {
    deleteInvitation,
    isDeleting
  };
}
