
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function useInvitationExpiration() {
  const queryClient = useQueryClient();

  const checkAndMarkExpired = async () => {
    try {
      // Primero verificar si hay invitaciones pendientes antes de ejecutar la función
      const { data: pendingInvitations, error: checkError } = await supabase
        .from('user_invitations')
        .select('id')
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString())
        .limit(1);

      if (checkError) {
        console.error("Error checking pending invitations:", checkError);
        return false;
      }

      // Solo ejecutar si hay invitaciones que expirar
      if (!pendingInvitations || pendingInvitations.length === 0) {
        return true; // No hay nada que hacer, pero es exitoso
      }

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

  // Check for expired invitations every 30 minutes (reducido de 5 minutos)
  const { data: success } = useQuery({
    queryKey: ["invitation-expiration-check"],
    queryFn: checkAndMarkExpired,
    refetchInterval: 30 * 60 * 1000, // 30 minutos en lugar de 5
    staleTime: 25 * 60 * 1000, // 25 minutos de cache
    gcTime: 60 * 60 * 1000, // 1 hora en garbage collection
    refetchOnReconnect: true,
    retry: 2, // Menos reintentos
  });

  // Invalidate invitations query when check succeeds
  React.useEffect(() => {
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    }
  }, [success, queryClient]);

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
