
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

  const inviteUser = async (email: string, role: 'admin' | 'user', companyId: string) => {
    try {
      setIsInviting(true);
      console.log(`Inviting user: ${email} with role: ${role} to company: ${companyId}`);

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("No hay sesión activa");
      }

      // Verificar si ya existe una invitación para este email
      const { data: existingInvitation, error: checkError } = await supabase
        .from('user_invitations')
        .select('id, status, company_id')
        .eq('email', email)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking for existing invitation:", checkError);
        throw checkError;
      }

      console.log("Existing invitation check result:", existingInvitation);

      // Get company name
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('nombre')
        .eq('id', companyId)
        .single();
        
      if (companyError) {
        console.error("Error fetching company:", companyError);
        throw new Error("No se pudo obtener información de la empresa");
      }

      if (existingInvitation) {
        // If invitation exists for same company and is expired, update it and resend
        if (existingInvitation.status === 'expired' && existingInvitation.company_id === companyId) {
          console.log("Found expired invitation, reactivating and resending");
          const invitation = {
            id: existingInvitation.id,
            status: 'expired',
            email,
            company_id: companyId
          } as UserInvitation;
          
          await resendInvitation(invitation);
          return;
        }
        
        // If invitation exists for same company and is pending
        if (existingInvitation.company_id === companyId) {
          console.log("Active invitation already exists for this company");
          await createInvitationLog(
            existingInvitation.id,
            'duplicate',
            'Ya existe una invitación para este email en esta empresa'
          );
          throw new Error("Ya existe una invitación para este email en esta empresa");
        }
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
          invitation_token: invitationToken,
          company_id: companyId
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
        body: { 
          invitationId: invitation.id,
          companyName: company.nombre
        }
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
