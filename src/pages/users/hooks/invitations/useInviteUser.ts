
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserInvitation } from "../../types";
import { useInvitationLogs } from "./useInvitationLogs";
import { useResendInvitation } from "./useResendInvitation";
import { useInvitationQueries } from "./useInvitationQueries";

/**
 * Hook for inviting new users
 */
export const useInviteUser = () => {
  const [isInviting, setIsInviting] = useState(false);
  const { createInvitationLog } = useInvitationLogs();
  const { resendInvitation } = useResendInvitation();
  const { invalidateInvitations } = useInvitationQueries();

  const inviteUser = async (email: string, role: 'admin' | 'user') => {
    try {
      setIsInviting(true);
      console.log(`Inviting user: ${email} with role: ${role}`);

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
        console.error("Error checking for existing invitation:", checkError);
        throw checkError;
      }

      console.log("Existing invitation check result:", existingInvitation);

      if (existingInvitation) {
        // If invitation exists but is expired, update it and resend
        if (existingInvitation.status === 'expired') {
          console.log("Found expired invitation, reactivating and resending");
          const invitation = {
            id: existingInvitation.id,
            status: 'expired',
            email
          } as UserInvitation;
          
          await resendInvitation(invitation);
          return;
        }
        
        console.log("Active invitation already exists");
        await createInvitationLog(
          existingInvitation.id,
          'duplicate',
          'Ya existe una invitación para este email'
        );
        throw new Error("Ya existe una invitación para este email");
      }
      
      // Crear la invitación con un nuevo token
      const invitationToken = crypto.randomUUID();
      console.log(`Generated new invitation token: ${invitationToken}`);
      
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
        console.error("Error creating invitation:", invitationError);
        throw invitationError || new Error('Error desconocido');
      }

      console.log("Invitation created successfully:", invitation);

      // Enviar el correo de invitación usando la Edge Function
      console.log("Calling send-invitation edge function with ID:", invitation.id);
      const { data, error: sendError } = await supabase.functions.invoke('send-invitation', {
        body: { invitationId: invitation.id }
      });

      console.log("Edge function response:", { data, sendError });

      if (sendError) {
        await createInvitationLog(invitation.id, 'email_failed', sendError.message);
        toast.error("Invitación creada, pero hubo un error al enviar el correo");
      } else {
        await createInvitationLog(invitation.id, 'email_sent', 'Correo enviado exitosamente');
        toast.success("Invitación enviada exitosamente");
      }
      
      invalidateInvitations();
    } catch (error: any) {
      console.error("Error inviting user:", error);
      toast.error(error.message);
    } finally {
      setIsInviting(false);
    }
  };

  return {
    inviteUser,
    isInviting
  };
};
