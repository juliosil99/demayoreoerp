
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  const { mutate: deleteInvitation, isPending: isDeleting } = useMutation({
    mutationFn: async (invitationId: string) => {
      console.log("🗑️ [DELETE] Starting deletion for invitation:", invitationId);
      
      // First, let's verify the invitation exists before deleting
      const { data: beforeDelete, error: beforeError } = await supabase
        .from('user_invitations')
        .select('id, email, status')
        .eq('id', invitationId);
      
      if (beforeError) {
        console.error("❌ [DELETE] Error checking invitation before delete:", beforeError);
        throw beforeError;
      }
      
      console.log("🔍 [DELETE] Invitation found before deletion:", beforeDelete);
      
      if (!beforeDelete || beforeDelete.length === 0) {
        console.warn("⚠️ [DELETE] Invitation not found before deletion!");
        throw new Error("Invitation not found");
      }

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
      
      // Verify the invitation was actually deleted
      const { data: afterDelete, error: afterError } = await supabase
        .from('user_invitations')
        .select('id, email, status')
        .eq('id', invitationId);
      
      if (afterError) {
        console.error("❌ [DELETE] Error checking invitation after delete:", afterError);
      } else {
        console.log("🔍 [DELETE] Invitation status after deletion:", afterDelete);
        if (afterDelete && afterDelete.length > 0) {
          console.warn("⚠️ [DELETE] WARNING: Invitation still exists after deletion!");
        } else {
          console.log("✅ [DELETE] Confirmed: Invitation no longer exists in database");
        }
      }
      
      return invitationId;
    },
    onSuccess: (deletedId) => {
      console.log("🎉 [DELETE] onSuccess triggered for invitation:", deletedId);
      
      // Log current cache state before invalidation
      const currentData = queryClient.getQueryData(["invitations"]);
      console.log("📊 [DELETE] Current invitations in cache before invalidation:", currentData);
      console.log("🆔 [DELETE] Cache invitation IDs before invalidation:", 
        Array.isArray(currentData) ? currentData.map((inv: any) => ({ id: inv.id, email: inv.email })) : "Not an array");
      
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
        console.log("🆔 [DELETE] Cache invitation IDs after invalidation:", 
          Array.isArray(updatedData) ? updatedData.map((inv: any) => ({ id: inv.id, email: inv.email })) : "Not an array");
        
        // Check if the deleted invitation is still in the cache
        if (Array.isArray(updatedData)) {
          const stillExists = updatedData.find((inv: any) => inv.id === deletedId);
          if (stillExists) {
            console.error("💥 [DELETE] CRITICAL: Deleted invitation still exists in cache after invalidation!", stillExists);
          } else {
            console.log("✅ [DELETE] SUCCESS: Deleted invitation no longer in cache");
          }
        }
      }, 500);
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
