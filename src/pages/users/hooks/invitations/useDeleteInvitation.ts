
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  const { mutate: deleteInvitation, isPending: isDeleting } = useMutation({
    mutationFn: async (invitationId: string) => {
      console.log("🗑️ [DELETE] Starting deletion for invitation:", invitationId);
      
      const { error, data } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId)
        .select();

      if (error) {
        console.error("❌ [DELETE] Error deleting invitation:", error);
        throw error;
      }

      console.log("✅ [DELETE] Successfully deleted invitation from database:", data);
      return invitationId;
    },
    onSuccess: (deletedId) => {
      console.log("🎉 [DELETE] onSuccess triggered for invitation:", deletedId);
      
      // Log current cache state before invalidation
      const currentData = queryClient.getQueryData(["invitations"]);
      console.log("📊 [DELETE] Current invitations in cache before invalidation:", currentData);
      
      // Invalidate and refetch invitations to update the UI
      console.log("🔄 [DELETE] Invalidating queries with key: ['invitations']");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      
      // Force refetch immediately
      console.log("🔄 [DELETE] Force refetching invitations...");
      queryClient.refetchQueries({ queryKey: ["invitations"] });
      
      toast.success("Invitación eliminada exitosamente");
      
      // Log cache state after invalidation (with slight delay)
      setTimeout(() => {
        const updatedData = queryClient.getQueryData(["invitations"]);
        console.log("📊 [DELETE] Cache data after invalidation:", updatedData);
      }, 100);
    },
    onError: (error: any) => {
      console.error("💥 [DELETE] onError triggered:", error);
      toast.error(`Error al eliminar la invitación: ${error.message}`);
    },
  });

  return {
    deleteInvitation,
    isDeleting
  };
}
