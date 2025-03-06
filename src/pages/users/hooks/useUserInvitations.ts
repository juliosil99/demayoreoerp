
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserInvitation } from "../types";

export function useUserInvitations() {
  const [isInviting, setIsInviting] = useState(false);
  const [isResending, setIsResending] = useState(false);
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
        toast.error("Error al cargar invitaciones: " + error.message);
        throw error;
      }

      console.log("Fetched invitations:", data);
      return data as UserInvitation[];
    },
  });

  const createInvitationLog = async (invitationId: string, status: string, errorMessage?: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('invitation_logs')
        .insert({
          invitation_id: invitationId,
          status,
          error_message: errorMessage,
          attempted_by: session.session?.user.id || '00000000-0000-0000-0000-000000000000'
        });

      if (error) {
        console.error("Error creating invitation log:", error);
      }
    } catch (err) {
      console.error("Error in createInvitationLog:", err);
    }
  };

  const resendInvitation = async (invitation: UserInvitation) => {
    try {
      setIsResending(true);
      
      // First, regenerate the invitation token
      const newToken = crypto.randomUUID();
      
      // Update the invitation with a new token
      const { error: updateError } = await supabase
        .from('user_invitations')
        .update({ 
          invitation_token: newToken,
          // Reset status to pending if it was expired
          status: invitation.status === 'expired' ? 'pending' : invitation.status
        })
        .eq('id', invitation.id);
        
      if (updateError) {
        throw new Error("Error al actualizar el token de invitación: " + updateError.message);
      }
      
      // Registrar el intento de reenvío
      await createInvitationLog(
        invitation.id,
        'resend_attempt',
        'Intento de reenvío de invitación'
      );

      // Llamar a la Edge Function para enviar el correo
      const { error } = await supabase.functions.invoke('send-invitation', {
        body: { invitationId: invitation.id }
      });

      if (error) {
        await createInvitationLog(invitation.id, 'email_failed', error.message);
        throw new Error("Error al reenviar la invitación: " + error.message);
      }

      await createInvitationLog(invitation.id, 'email_sent', 'Correo reenviado exitosamente');
      toast.success("Invitación reenviada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast.error(error.message);
    } finally {
      setIsResending(false);
    }
  };

  const inviteUser = async (email: string, role: 'admin' | 'user') => {
    try {
      setIsInviting(true);

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No hay sesión activa");
      }

      // Verificar si ya existe una invitación para este email
      const { data: existingInvitation, error: checkError } = await supabase
        .from('user_invitations')
        .select('id, status')
        .eq('email', email)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingInvitation) {
        // If invitation exists but is expired, update it and resend
        if (existingInvitation.status === 'expired') {
          const invitation = {
            id: existingInvitation.id,
            status: 'expired'
          } as UserInvitation;
          
          await resendInvitation(invitation);
          return;
        }
        
        await createInvitationLog(
          existingInvitation.id,
          'duplicate',
          'Ya existe una invitación para este email'
        );
        throw new Error("Ya existe una invitación para este email");
      }
      
      // Crear la invitación con un nuevo token
      const invitationToken = crypto.randomUUID();
      
      const { data: invitation, error: invitationError } = await supabase
        .from('user_invitations')
        .insert({
          email,
          role,
          status: 'pending',
          invited_by: session.session.user.id,
          invitation_token: invitationToken
        })
        .select()
        .single();

      if (invitationError || !invitation) {
        throw invitationError || new Error('Error desconocido');
      }

      // Enviar el correo de invitación usando la Edge Function
      const { error: sendError } = await supabase.functions.invoke('send-invitation', {
        body: { invitationId: invitation.id }
      });

      if (sendError) {
        await createInvitationLog(invitation.id, 'email_failed', sendError.message);
        toast.error("Invitación creada, pero hubo un error al enviar el correo");
      } else {
        await createInvitationLog(invitation.id, 'email_sent', 'Correo enviado exitosamente');
        toast.success("Invitación enviada exitosamente");
      }
      
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
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
    isInviting,
    resendInvitation,
    isResending,
    isLoading
  };
}
