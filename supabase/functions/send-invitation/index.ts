
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitationId }: InvitationRequest = await req.json();
    console.log("Procesando invitación:", invitationId);

    // Obtener la invitación
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

    // Generar nuevo token si no existe o si es necesario regenerarlo
    if (!invitation.invitation_token) {
      console.log("Generando nuevo token de invitación");
      const token = crypto.randomUUID();
      
      const { data: updatedInvitation, error: updateError } = await supabase
        .from("user_invitations")
        .update({ 
          invitation_token: token,
          status: "pending" // Ensure status is pending
        })
        .eq("id", invitationId)
        .select()
        .single();

      if (updateError) {
        console.error("Error actualizando token de invitación:", updateError);
        throw new Error("Error al actualizar el token de invitación");
      }

      console.log("Token actualizado:", updatedInvitation.invitation_token);
      invitation.invitation_token = updatedInvitation.invitation_token;
    }

    // Obtener información de la empresa para personalizar el correo
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select("nombre")
      .eq("user_id", invitation.invited_by)
      .maybeSingle();

    const companyName = companyData?.nombre || "Sistema ERP";
    console.log("Nombre de empresa para correo:", companyName);

    // Generar el enlace de invitación con el token
    const origin = req.headers.get("origin") || "https://demayoreoerp.lovable.app";
    const invitationLink = `${origin}/register?token=${invitation.invitation_token}`;
    console.log("Enlace de invitación generado:", invitationLink);
    
    // Obtener información del usuario que invita
    const { data: inviterData, error: inviterError } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", invitation.invited_by)
      .maybeSingle();

    const inviterName = inviterData && (inviterData.first_name || inviterData.last_name) 
      ? `${inviterData.first_name || ''} ${inviterData.last_name || ''}`.trim()
      : inviterData?.email || "Un administrador";
    
    console.log("Invitador:", inviterName);
    
    // Plantilla de correo mejorada
    const htmlContent = `
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

    console.log("Enviando correo a:", invitation.email);
    console.log("Contenido del correo preparado");

    // Enviar el correo
    try {
      const emailResponse = await resend.emails.send({
        from: `${companyName} <onboarding@resend.dev>`,
        to: [invitation.email],
        subject: `Invitación a ${companyName}`,
        html: htmlContent,
      });

      console.log("Correo enviado exitosamente:", emailResponse);

      // Actualizar el log de invitación
      await supabase.from("invitation_logs").insert({
        invitation_id: invitationId,
        status: "email_sent",
        error_message: null,
        attempted_by: invitation.invited_by
      });

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
    } catch (emailError: any) {
      console.error("Error enviando correo:", emailError);
      
      // Log the email error
      await supabase.from("invitation_logs").insert({
        invitation_id: invitationId,
        status: "email_error",
        error_message: emailError.message || "Error enviando correo",
        attempted_by: invitation.invited_by
      });
      
      throw new Error("Error al enviar el correo: " + (emailError.message || "Error desconocido"));
    }
  } catch (error: any) {
    console.error("Error en función send-invitation:", error);
    
    // Registrar el error
    if (error.invitationId) {
      await supabase.from("invitation_logs").insert({
        invitation_id: error.invitationId,
        status: "error",
        error_message: error.message,
        attempted_by: "00000000-0000-0000-0000-000000000000" // Un valor por defecto
      });
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
