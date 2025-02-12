
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserInvitation } from "../types";

export function useUserInvitations() {
  const [isInviting, setIsInviting] = useState(false);

  const { data: invitations, refetch } = useQuery({
    queryKey: ["user-invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Error al cargar invitaciones: " + error.message);
        throw error;
      }

      return data as UserInvitation[];
    },
  });

  const inviteUser = async (email: string, role: 'admin' | 'user') => {
    try {
      setIsInviting(true);
      const { error } = await supabase
        .from('user_invitations')
        .insert({
          email,
          role,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Invitación enviada correctamente");
      refetch();
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast.error(error.message);
    } finally {
      setIsInviting(false);
    }
  };

  return {
    invitations,
    inviteUser,
    isInviting
  };
}
