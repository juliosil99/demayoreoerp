
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserInvitation } from "../types";

export function useUserInvitations() {
  const [isInviting, setIsInviting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { data: invitations, refetch } = useQuery({
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

      return data as UserInvitation[];
    },
  });

  const createInvitationLog = async (invitationId: string, status: string, errorMessage?: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("No hay sesión activa");
    }

    const { error } = await supabase
      .from('invitation_logs')
      .insert({
        invitation_id: invitationId,
        status,
        error_message: errorMessage,
        attempted_by: session.session.user.id
      });

    if (error) {
      console.error("Error creating invitation log:", error);
    }
  };

  const resendInvitation = async (invitation: UserInvitation) => {
    try {
      setIsResending(true);
      
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
        throw new Error("Error al reenviar la invitación");
      }

      await createInvitationLog(invitation.id, 'email_sent', 'Correo reenviado exitosamente');
      toast.success("Invitación reenviada exitosamente");
      refetch();
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
      const { data: existingInvitation } = await supabase
        .from('user_invitations')
        .select('id, status')
        .eq('email', email)
        .single();

      if (existingInvitation) {
        await createInvitationLog(
          existingInvitation.id,
          'duplicate',
          'Ya existe una invitación para este email'
        );
        throw new Error("Ya existe una invitación para este email");
      }
      
      // Crear la invitación
      const { data: invitation, error: invitationError } = await supabase
        .from('user_invitations')
        .insert({
          email,
          role,
          status: 'pending',
          invited_by: session.session.user.id
        })
        .select()
        .single();

      if (invitationError || !invitation) {
        await createInvitationLog(
          invitation?.id || '00000000-0000-0000-0000-000000000000',
          'error',
          invitationError?.message || 'Error desconocido'
        );
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
    isInviting,
    resendInvitation,
    isResending
  };
}
