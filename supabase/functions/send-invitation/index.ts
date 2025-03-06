
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

    // Obtener la invitación y la plantilla de correo
    const { data: invitation, error: invitationError } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("id", invitationId)
      .single();

    if (invitationError || !invitation) {
      console.error("Error obteniendo invitación:", invitationError);
      throw new Error("No se encontró la invitación");
    }

    console.log("Invitación encontrada:", invitation);

    // Generar nuevo token si no existe
    if (!invitation.invitation_token) {
      console.log("Generando nuevo token de invitación");
      const token = crypto.randomUUID();
      
      const { data: updatedInvitation, error: updateError } = await supabase
        .from("user_invitations")
        .update({ invitation_token: token })
        .eq("id", invitationId)
        .select()
        .single();

      if (updateError) {
        console.error("Error actualizando token de invitación:", updateError);
        throw new Error("Error al actualizar el token de invitación");
      }

      invitation.invitation_token = updatedInvitation.invitation_token;
    }

    // Generar el enlace de invitación con el token
    const origin = req.headers.get("origin") || "https://demayoreoerp.lovable.app";
    const invitationLink = `${origin}/register?token=${invitation.invitation_token}`;
    console.log("Enlace de invitación generado:", invitationLink);
    
    // Plantilla de correo simple (podemos mejorarla después)
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invitación al Sistema ERP</h2>
        <p>Has sido invitado a unirte al sistema ERP. Para completar tu registro, haz clic en el siguiente enlace:</p>
        <p style="margin: 20px 0;">
          <a href="${invitationLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Completar registro
          </a>
        </p>
        <p>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
        <p>${invitationLink}</p>
        <p>Este enlace expirará en 7 días.</p>
      </div>
    `;

    // Enviar el correo
    const emailResponse = await resend.emails.send({
      from: "ERP System <onboarding@resend.dev>",
      to: [invitation.email],
      subject: "Invitación al Sistema ERP",
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

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
