
// Email utility functions for the send-invitation edge function

/**
 * Generates the HTML email content
 */
export function generateEmailContent(invitation: any, invitationLink: string, companyName: string, inviterName: string) {
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
 * Handles CORS for the edge function
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Creates an error response with CORS headers
 */
export function createErrorResponse(error: any, status = 500) {
  console.error("Error in function:", error);
  
  return new Response(
    JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

/**
 * Creates a success response with CORS headers
 */
export function createSuccessResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data), 
    {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

/**
 * Verifies that a token exists in the database
 */
export async function verifyTokenInDatabase(supabase: any, token: string) {
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
