
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, createErrorResponse, createSuccessResponse, generateEmailContent, verifyTokenInDatabase } from "./utils.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { invitationId } = await req.json();

    if (!invitationId) {
      return createErrorResponse(new Error("ID de invitación requerido"), 400);
    }

    console.log("Procesando invitación:", invitationId);

    // Get invitation with company information using explicit text conversion
    const { data: invitation, error: invitationError } = await supabaseClient
      .from("user_invitations")
      .select("*, companies:company_id(nombre)")
      .eq("id", invitationId)
      .single();

    if (invitationError || !invitation) {
      console.error("Error obteniendo invitación:", invitationError);
      return createErrorResponse(new Error("Invitación no encontrada"), 404);
    }

    console.log("Invitación encontrada:", invitation);

    // Use the existing token or generate a new one if missing
    let finalToken = invitation.invitation_token;
    if (!finalToken) {
      finalToken = crypto.randomUUID();
      
      // Update invitation with new token
      const { error: updateError } = await supabaseClient
        .from("user_invitations")
        .update({ invitation_token: finalToken })
        .eq("id", invitationId);

      if (updateError) {
        console.error("Error actualizando token:", updateError);
        return createErrorResponse(updateError);
      }
    }

    console.log("Token final que se utilizará:", finalToken);

    // Verify token exists in database using text conversion
    await verifyTokenInDatabase(supabaseClient, finalToken);

    // Get company name for email
    const companyName = invitation.companies?.nombre || "la empresa";
    console.log("Nombre de empresa para correo:", companyName);

    // Get inviter information
    const { data: inviterProfile } = await supabaseClient
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", invitation.invited_by)
      .maybeSingle();

    const inviterName = inviterProfile?.first_name && inviterProfile?.last_name
      ? `${inviterProfile.first_name} ${inviterProfile.last_name}`
      : "Un administrador";

    console.log("Invitador:", inviterName);

    // Generate invitation link - using explicit string conversion
    const baseUrl = Deno.env.get("SITE_URL") || "https://b939291a-76a2-4acc-818c-4c3ec78294f9.lovableproject.com";
    const invitationLink = `${baseUrl}/register?token=${finalToken}`;
    console.log("Enlace de invitación generado:", invitationLink);

    console.log("Enviando correo a:", invitation.email);

    // Send email using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return createErrorResponse(new Error("Clave API de Resend no configurada"), 500);
    }

    const emailContent = generateEmailContent(invitation, invitationLink, companyName, inviterName);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ERP Sistema <onboarding@resend.dev>",
        to: [invitation.email],
        subject: `Invitación a unirse a ${companyName}`,
        html: emailContent,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Error enviando correo:", emailData);
      return createErrorResponse(new Error(`Error enviando correo: ${emailData.message}`));
    }

    console.log("Correo enviado exitosamente:", emailData);

    // Log successful email send
    await supabaseClient.from("invitation_logs").insert({
      invitation_id: invitationId,
      status: "email_sent",
      error_message: null,
      attempted_by: invitation.invited_by
    });

    return createSuccessResponse({
      success: true,
      message: "Invitación enviada exitosamente",
      emailId: emailData.id,
      invitationLink: invitationLink
    });

  } catch (error) {
    return createErrorResponse(error);
  }
});
