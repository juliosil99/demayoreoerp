
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { 
  Invitation,
  CompanyData,
  InviterProfile,
  EmailResponse,
  SupabaseClient,
  generateEmailContent, 
  corsHeaders, 
  createErrorResponse, 
  createSuccessResponse,
  verifyTokenInDatabase
} from "./utils.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

interface InvitationRequest {
  invitationId: string;
}

interface InvitationLogEntry {
  invitation_id: string;
  status: string;
  error_message: string | null;
  attempted_by: string;
}

/**
 * Fetches invitation data from the database
 */
async function getInvitationData(invitationId: string): Promise<Invitation> {
  console.log("Procesando invitación:", invitationId);

  const { data: invitation, error: invitationError } = await supabase
    .from("user_invitations")
    .select("*")
    .eq("id", invitationId)
    .single();

  if (invitationError || !invitation) {
    console.error("Error obteniendo invitación:", invitationError);
    console.error("ID de invitación buscado:", invitationId);
    throw new Error("No se encontró la invitación");
  }

  console.log("Invitación encontrada:", invitation);
  return invitation as Invitation;
}

/**
 * Generates or validates the invitation token
 */
async function ensureInvitationToken(invitation: Invitation): Promise<Invitation> {
  // Generate new token if needed
  if (!invitation.invitation_token) {
    console.log("Invitación sin token, generando nuevo token");
    const token = crypto.randomUUID();
    
    console.log("Nuevo token generado:", token);
    
    const { data: updatedInvitation, error: updateError } = await supabase
      .from("user_invitations")
      .update({ 
        invitation_token: token,
        status: "pending" 
      })
      .eq("id", invitation.id)
      .select()
      .single();

    if (updateError || !updatedInvitation) {
      console.error("Error actualizando token de invitación:", updateError);
      throw new Error("Error al actualizar el token de invitación");
    }

    console.log("Token actualizado:", updatedInvitation.invitation_token);
    
    // Asegurarnos de que el token se guarde correctamente
    await verifyTokenInDatabase(supabase as unknown as SupabaseClient, updatedInvitation.invitation_token);
    
    return updatedInvitation as Invitation;
  } else {
    console.log("Token existente:", invitation.invitation_token);
    
    // Double check: verify token exists in database and is correctly stored
    await verifyTokenInDatabase(supabase as unknown as SupabaseClient, invitation.invitation_token);
    
    // For existing tokens, verify they exist in the database correctly
    const { data: verifyInvitation, error: verifyError } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("invitation_token", invitation.invitation_token)
      .maybeSingle();
      
    if (verifyError) {
      console.error("Error verificando token en base de datos:", verifyError);
    }
    
    if (!verifyInvitation) {
      console.warn("Token no encontrado en la base de datos, actualizando...");
      // Token doesn't exist or doesn't match, update it
      const newToken = crypto.randomUUID();
      console.log("Generando nuevo token de reemplazo:", newToken);
      
      const { data: reUpdatedInvitation, error: reUpdateError } = await supabase
        .from("user_invitations")
        .update({ 
          invitation_token: newToken,
          status: "pending" 
        })
        .eq("id", invitation.id)
        .select()
        .single();
      
      if (reUpdateError || !reUpdatedInvitation) {
        console.error("Error al actualizar token de reemplazo:", reUpdateError);
        throw new Error("Error al actualizar el token de invitación");
      }
      
      console.log("Token de reemplazo actualizado:", reUpdatedInvitation.invitation_token);
      
      // Verify again that the replacement token is stored properly
      await verifyTokenInDatabase(supabase as unknown as SupabaseClient, reUpdatedInvitation.invitation_token);
      
      return reUpdatedInvitation as Invitation;
    }
  }
  
  // Explicitly log the final token
  console.log("Token final que se utilizará:", invitation.invitation_token);
  
  return invitation;
}

/**
 * Gets company information for the email
 */
async function getCompanyInfo(invitedById: string): Promise<string> {
  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("nombre")
    .eq("user_id", invitedById)
    .maybeSingle();

  return (companyData as CompanyData)?.nombre || "Sistema ERP";
}

/**
 * Gets inviter information
 */
async function getInviterInfo(inviterId: string): Promise<string> {
  const { data: inviterData, error: inviterError } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", inviterId)
    .maybeSingle();

  const profile = inviterData as InviterProfile;
  const inviterName = profile && (profile.first_name || profile.last_name) 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : profile?.email || "Un administrador";
  
  return inviterName;
}

/**
 * Sends the invitation email
 */
async function sendInvitationEmail(invitation: Invitation, htmlContent: string, companyName: string): Promise<EmailResponse> {
  console.log("Enviando correo a:", invitation.email);
  
  try {
    const emailResponse = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: [invitation.email],
      subject: `Invitación a ${companyName}`,
      html: htmlContent,
    });

    console.log("Correo enviado exitosamente:", emailResponse);
    return emailResponse as EmailResponse;
  } catch (error: any) {
    console.error("Error enviando correo:", error);
    
    // Log the email error
    await logInvitationEvent(invitation.id, "email_error", error.message || "Error enviando correo", invitation.invited_by);
    
    throw new Error("Error al enviar el correo: " + (error.message || "Error desconocido"));
  }
}

/**
 * Logs invitation events to the database
 */
async function logInvitationEvent(invitationId: string, status: string, errorMessage: string | null, attemptedBy: string): Promise<void> {
  try {
    const logEntry: InvitationLogEntry = {
      invitation_id: invitationId,
      status,
      error_message: errorMessage,
      attempted_by: attemptedBy
    };
    
    const { error } = await supabase.from("invitation_logs").insert(logEntry);
    
    if (error) {
      console.error("Error logging invitation event:", error);
    } else {
      console.log("Invitation event logged successfully:", { status, errorMessage });
    }
  } catch (error) {
    console.error("Error logging invitation event:", error);
  }
}

/**
 * Main handler function for the Edge Function
 */
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitationId }: InvitationRequest = await req.json();
    
    // Get invitation data
    const invitation = await getInvitationData(invitationId);
    
    // Ensure invitation has a valid token
    const validatedInvitation = await ensureInvitationToken(invitation);
    
    // Get company info for email
    const companyName = await getCompanyInfo(invitation.invited_by);
    console.log("Nombre de empresa para correo:", companyName);
    
    // Generate invitation link
    const origin = req.headers.get("origin") || "https://demayoreoerp.lovable.app";
    const invitationLink = `${origin}/register?token=${validatedInvitation.invitation_token}`;
    console.log("Enlace de invitación generado:", invitationLink);
    
    // Get inviter info
    const inviterName = await getInviterInfo(invitation.invited_by);
    console.log("Invitador:", inviterName);
    
    // Generate email content
    const htmlContent = generateEmailContent(validatedInvitation, invitationLink, companyName, inviterName);
    
    // Send email
    await sendInvitationEmail(validatedInvitation, htmlContent, companyName);
    
    // Log successful email sending
    await logInvitationEvent(invitationId, "email_sent", null, invitation.invited_by);

    // Return detailed success response
    return createSuccessResponse({ 
      success: true, 
      message: "Invitación enviada correctamente",
      invitation: {
        id: invitation.id,
        email: invitation.email,
        token: validatedInvitation.invitation_token,
        link: invitationLink
      }
    });
    
  } catch (error: any) {
    console.error("Error en función send-invitation:", error);
    
    // Log generic error
    if (error.invitationId) {
      await logInvitationEvent(
        error.invitationId,
        "error",
        error.message,
        "00000000-0000-0000-0000-000000000000"
      );
    }

    return createErrorResponse(error);
  }
};

serve(handler);
