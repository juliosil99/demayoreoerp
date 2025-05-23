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
  companyName?: string;
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
    .select("*, companies:company_id(nombre)")
    .eq("id", invitationId)
    .single();

  if (invitationError || !invitation) {
    console.error("Error obteniendo invitación:", invitationError);
    console.error("ID de invitación buscado:", invitationId);
    throw new Error("No se encontró la invitación");
  }

  console.log("Invitación encontrada:", invitation);
  return invitation as unknown as Invitation;
}

/**
 * Generates or validates the invitation token
 */
async function ensureInvitationToken(invitation: Invitation): Promise<Invitation> {
  // Generate new token if needed
  if (!invitation.invitation_token) {
    console.log("Generando nuevo token de invitación");
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

    if (updateError) {
      console.error("Error actualizando token de invitación:", updateError);
      throw new Error("Error al actualizar el token de invitación");
    }

    console.log("Token actualizado:", updatedInvitation.invitation_token);
    invitation.invitation_token = updatedInvitation.invitation_token;
  } else {
    console.log("Token existente:", invitation.invitation_token);
  }

  // Double check: verify token exists in database
  await verifyTokenInDatabase(supabase as unknown as SupabaseClient, invitation.invitation_token);
  
  // Explicitly log the final token
  console.log("Token final que se utilizará:", invitation.invitation_token);
  
  return invitation;
}

/**
 * Gets company information for the email
 */
async function getCompanyInfo(invitation: Invitation, companyNameOverride?: string): Promise<string> {
  // If a company name is provided directly in the function call, use it
  if (companyNameOverride) {
    return companyNameOverride;
  }

  // If the invitation has company info from the join, use it
  if (invitation.companies && invitation.companies.nombre) {
    return invitation.companies.nombre;
  }

  // Otherwise, try to get the inviter's company
  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("nombre")
    .eq("user_id", invitation.invited_by)
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
    
    await supabase.from("invitation_logs").insert(logEntry);
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
    const { invitationId, companyName }: InvitationRequest = await req.json();
    
    // Get invitation data
    const invitation = await getInvitationData(invitationId);
    
    // Ensure invitation has a valid token
    const validatedInvitation = await ensureInvitationToken(invitation);
    
    // Get company info for email
    const companyNameToUse = await getCompanyInfo(validatedInvitation, companyName);
    console.log("Nombre de empresa para correo:", companyNameToUse);
    
    // Generate invitation link
    const origin = req.headers.get("origin") || "https://demayoreoerp.lovable.app";
    const invitationLink = `${origin}/register?token=${validatedInvitation.invitation_token}`;
    console.log("Enlace de invitación generado:", invitationLink);
    
    // Get inviter info
    const inviterName = await getInviterInfo(invitation.invited_by);
    console.log("Invitador:", inviterName);
    
    // Generate email content
    const htmlContent = generateEmailContent(validatedInvitation, invitationLink, companyNameToUse, inviterName);
    
    // Send email
    await sendInvitationEmail(validatedInvitation, htmlContent, companyNameToUse);
    
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
        link: invitationLink,
        company: companyNameToUse
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
