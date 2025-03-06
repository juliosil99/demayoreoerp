
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserInvitation } from "../../types";
import { useInvitationLogs } from "./useInvitationLogs";
import { useInvitationQueries } from "./useInvitationQueries";

/**
 * Hook for resending invitations
 */
export const useResendInvitation = () => {
  const [isResending, setIsResending] = useState(false);
  const { createInvitationLog } = useInvitationLogs();
  const { invalidateInvitations, updateInvitationCache } = useInvitationQueries();

  const resendInvitation = async (invitation: UserInvitation) => {
    try {
      setIsResending(true);
      console.log(`Resending invitation to ${invitation.email}, current status: ${invitation.status}`);
      
      // First, regenerate the invitation token
      const newToken = crypto.randomUUID();
      console.log(`Generated new token: ${newToken}`);
      
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
        console.error("Error updating invitation token:", updateError);
        throw new Error("Error al actualizar el token de invitación: " + updateError.message);
      }
      
      console.log("Invitation token updated successfully");
      
      // Registrar el intento de reenvío
      await createInvitationLog(
        invitation.id,
        'resend_attempt',
        'Intento de reenvío de invitación'
      );

      // Llamar a la Edge Function para enviar el correo
      console.log("Calling send-invitation edge function with ID:", invitation.id);
      const { data, error } = await supabase.functions.invoke('send-invitation', {
        body: { invitationId: invitation.id }
      });

      console.log("Edge function response:", { data, error });

      if (error) {
        await createInvitationLog(invitation.id, 'email_failed', error.message);
        throw new Error("Error al reenviar la invitación: " + error.message);
      }

      await createInvitationLog(invitation.id, 'email_sent', 'Correo reenviado exitosamente');
      toast.success("Invitación reenviada exitosamente");
      
      // Update the cache with the updated invitation
      const updatedInvitation = { 
        ...invitation, 
        invitation_token: newToken, 
        status: invitation.status === 'expired' ? 'pending' : invitation.status 
      };
      
      updateInvitationCache(updatedInvitation);
      
      // Also invalidate to ensure fresh data
      invalidateInvitations();
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast.error(error.message);
    } finally {
      setIsResending(false);
    }
  };

  return {
    resendInvitation,
    isResending
  };
};
