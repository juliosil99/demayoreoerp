
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  invitationId: string;
}

/**
 * Fetches invitation data from the database
 */
async function getInvitationData(invitationId: string) {
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
  return invitation;
}

/**
 * Generates or validates the invitation token
 */
async function ensureInvitationToken(invitation: any) {
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
  }

  // Verify token exists in database
  await verifyTokenInDatabase(invitation.invitation_token);
  
  return invitation;
}

/**
 * Verifies that the token exists in the database
 */
async function verifyTokenInDatabase(token: string) {
  const { data: tokenCheck, error: tokenCheckError } = await supabase
    .from("user_invitations")
    .select("id")
    .eq("invitation_token", token)
    .maybeSingle();
    
  if (tokenCheckError) {
    console.error("Error verificando token en la base de datos:", tokenCheckError);
  } else {
    console.log("Verificación de token en base de datos:", tokenCheck ? "Encontrado" : "No encontrado");
  }
}

/**
 * Gets company information for the email
 */
async function getCompanyInfo(invitedById: string) {
  const { data: companyData, error: companyError } = await supabase
    .from("companies")
    .select("nombre")
    .eq("user_id", invitedById)
    .maybeSingle();

  return companyData?.nombre || "Sistema ERP";
}

/**
 * Gets inviter information
 */
async function getInviterInfo(inviterId: string) {
  const { data: inviterData, error: inviterError } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", inviterId)
    .maybeSingle();

  const inviterName = inviterData && (inviterData.first_name || inviterData.last_name) 
    ? `${inviterData.first_name || ''} ${inviterData.last_name || ''}`.trim()
    : inviterData?.email || "Un administrador";
  
  return inviterName;
}

/**
 * Generates the HTML email content
 */
function generateEmailContent(invitation: any, invitationLink: string, companyName: string, inviterName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #4F46E5;">Invitación a ${companyName}</h2>
      </div>

      <p>Hola,</p>
      <p>${inviterName} te ha invitado a unirte a <strong>${companyName}</strong> en el sistema ERP. Para completar tu registro, haz clic en el siguiente botón:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitationLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
          Completar registro
        </a>
      </div>
      
      <p>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
      <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">${invitationLink}</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
        <p>Este enlace expirará en 7 días. Si no reconoces esta invitación, puedes ignorar este correo.</p>
        <p>ID de Invitación: ${invitation.id}</p>
        <p>Token: ${invitation.invitation_token}</p>
      </div>
    </div>
  `;
}

/**
 * Sends the invitation email
 */
async function sendInvitationEmail(invitation: any, htmlContent: string, companyName: string) {
  console.log("Enviando correo a:", invitation.email);
  
  try {
    const emailResponse = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: [invitation.email],
      subject: `Invitación a ${companyName}`,
      html: htmlContent,
    });

    console.log("Correo enviado exitosamente:", emailResponse);
    return emailResponse;
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
async function logInvitationEvent(invitationId: string, status: string, errorMessage: string | null, attemptedBy: string) {
  try {
    await supabase.from("invitation_logs").insert({
      invitation_id: invitationId,
      status,
      error_message: errorMessage,
      attempted_by: attemptedBy
    });
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
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitación enviada correctamente",
        invitation: {
          id: invitation.id,
          email: invitation.email,
          token: invitation.invitation_token,
          link: invitationLink
        }
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
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

    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
