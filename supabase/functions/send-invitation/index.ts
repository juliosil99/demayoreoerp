
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
    console.log("Processing invitation:", invitationId);

    // Obtener la invitación y la plantilla de correo
    const { data: invitation, error: invitationError } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("id", invitationId)
      .single();

    if (invitationError || !invitation) {
      console.error("Error fetching invitation:", invitationError);
      throw new Error("No se encontró la invitación");
    }

    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("name", "user_invitation")
      .single();

    if (templateError || !template) {
      console.error("Error fetching template:", templateError);
      throw new Error("No se encontró la plantilla de correo");
    }

    // Generar el enlace de invitación
    const invitationLink = `${req.headers.get("origin")}/register?token=${invitation.invitation_token}`;
    const htmlContent = template.html_content.replace("{{invitationLink}}", invitationLink);

    // Enviar el correo
    const emailResponse = await resend.emails.send({
      from: "ERP System <onboarding@resend.dev>",
      to: [invitation.email],
      subject: template.subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    // Actualizar el log de invitación
    await supabase.from("invitation_logs").insert({
      invitation_id: invitationId,
      status: "email_sent",
      error_message: null,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
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
