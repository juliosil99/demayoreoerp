
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UserInvitation } from "../../types";
import { useInvitationLogs } from "./useInvitationLogs";
import { useInvitationQueries } from "./useInvitationQueries";

export function useResendInvitation() {
  const [isResending, setIsResending] = useState(false);
  const { createInvitationLog } = useInvitationLogs();
  const { invalidateInvitations } = useInvitationQueries();
  
  const resendInvitation = async (invitation: UserInvitation) => {
    try {
      setIsResending(true);
      console.log(`Resending invitation to: ${invitation.email}`);
      
      // Update the invitation status to pending and generate a new token if needed
      const invitationToken = invitation.invitation_token || crypto.randomUUID();
      
      const { error: updateError } = await supabase
        .from('user_invitations')
        .update({ 
          status: 'pending',
          invitation_token: invitationToken
        })
        .eq('id', invitation.id);
      
      if (updateError) {
        console.error("Error updating invitation:", updateError);
        throw updateError;
      }
      
      // Get company info if applicable
      let companyName = null;
      if (invitation.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('nombre')
          .eq('id', invitation.company_id)
          .single();
          
        if (company) {
          companyName = company.nombre;
        }
      }
      
      // Call send-invitation edge function
      const { data, error: sendError } = await supabase.functions.invoke('send-invitation', {
        body: { 
          invitationId: invitation.id,
          companyName: companyName || invitation.company_name
        }
      });
      
      if (sendError) {
        console.error("Error sending invitation email:", sendError);
        await createInvitationLog(invitation.id, 'email_failed', sendError.message);
        toast.error("Error al enviar la invitación por email");
        throw sendError;
      }
      
      await createInvitationLog(invitation.id, 'email_sent', 'Correo reenviado exitosamente');
      toast.success("Invitación reenviada exitosamente");
      
      // Refresh the invitations list
      invalidateInvitations();
      
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast.error(error.message || "Error al reenviar la invitación");
    } finally {
      setIsResending(false);
    }
  };
  
  return {
    resendInvitation,
    isResending
  };
}
