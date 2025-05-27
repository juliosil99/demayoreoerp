
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useInvitationExpiration() {
  const queryClient = useQueryClient();

  const checkAndMarkExpired = async () => {
    try {
      // Call the database function to mark expired invitations
      const { error } = await supabase.rpc('mark_expired_invitations');
      
      if (error) {
        console.error("Error marking expired invitations:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Unexpected error marking expired invitations:", error);
      return false;
    }
  };

  // Check for expired invitations every 5 minutes
  useQuery({
    queryKey: ["invitation-expiration-check"],
    queryFn: checkAndMarkExpired,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    onSuccess: (success) => {
      if (success) {
        // Invalidate invitations query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["invitations"] });
      }
    }
  });

  const manualCheck = async () => {
    const success = await checkAndMarkExpired();
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitaciones expiradas actualizadas");
    } else {
      toast.error("Error al verificar invitaciones expiradas");
    }
  };

  return { manualCheck };
}
