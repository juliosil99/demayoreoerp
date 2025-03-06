
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserInvitation } from "../../types";

/**
 * Hook for fetching invitations data
 */
export const useInvitationQueries = () => {
  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["user-invitations"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No hay sesión activa");
      }

      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading invitations:", error);
        toast.error("Error al cargar invitaciones: " + error.message);
        throw error;
      }

      console.log("Fetched invitations:", data);
      return data as UserInvitation[];
    },
  });

  const invalidateInvitations = () => {
    queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
  };

  const updateInvitationCache = (updatedInvitation: UserInvitation) => {
    const currentInvitations = queryClient.getQueryData<UserInvitation[]>(["user-invitations"]) || [];
    const updatedInvitations = currentInvitations.map(inv => 
      inv.id === updatedInvitation.id ? updatedInvitation : inv
    );
    
    queryClient.setQueryData(["user-invitations"], updatedInvitations);
  };

  return {
    invitations,
    isLoading,
    invalidateInvitations,
    updateInvitationCache,
    queryClient
  };
};
