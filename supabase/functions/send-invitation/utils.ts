
// Email utility functions for the send-invitation edge function

/**
 * Interface for invitation data
 */
export interface Invitation {
  id: string;
  email: string;
  status: string;
  invited_by: string;
  invitation_token: string;
}

/**
 * Interface for company data
 */
export interface CompanyData {
  nombre?: string;
}

/**
 * Interface for inviter profile data
 */
export interface InviterProfile {
  first_name?: string;
  last_name?: string;
  email?: string;
}

/**
 * Interface for email response data
 */
export interface EmailResponse {
  id: string;
  from: string;
  to: string;
  status: string;
}

/**
 * Generates the HTML email content
 */
export function generateEmailContent(invitation: Invitation, invitationLink: string, companyName: string, inviterName: string) {
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
 * Interface for error response
 */
export interface ErrorResponseData {
  error: string;
  stack?: string;
  timestamp: string;
}

/**
 * Creates an error response with CORS headers
 */
export function createErrorResponse(error: any, status = 500): Response {
  console.error("Error in function:", error);
  
  const responseData: ErrorResponseData = {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };
  
  return new Response(
    JSON.stringify(responseData),
    {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

/**
 * Interface for success response
 */
export interface SuccessResponseData<T = any> {
  success: boolean;
  message?: string;
  [key: string]: any;
}

/**
 * Creates a success response with CORS headers
 */
export function createSuccessResponse<T>(data: T, status = 200): Response {
  return new Response(
    JSON.stringify(data), 
    {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

/**
 * Interface for Supabase client
 */
export interface SupabaseClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: any) => {
        maybeSingle: () => Promise<{ data: any, error: any }>;
        single: () => Promise<{ data: any, error: any }>;
      };
    };
    update: (data: any) => {
      eq: (column: string, value: any) => {
        select: (columns?: string) => {
          single: () => Promise<{ data: any, error: any }>;
        };
      };
    };
    insert: (data: any) => Promise<{ data: any, error: any }>;
  };
}

/**
 * Verifies that a token exists in the database
 */
export async function verifyTokenInDatabase(supabase: SupabaseClient, token: string): Promise<void> {
  console.log("Verifying token in database:", token);
  
  // Try both UUID and string formats for better compatibility
  try {
    // First check with standard column comparison
    const { data: tokenCheck, error: tokenCheckError } = await supabase
      .from("user_invitations")
      .select("id, invitation_token")
      .eq("invitation_token", token)
      .maybeSingle();
      
    if (tokenCheckError) {
      console.error("Error verificando token en la base de datos:", tokenCheckError);
    } else {
      console.log("Verificación de token en base de datos:", tokenCheck ? "Encontrado" : "No encontrado");
      console.log("Detalles del token encontrado:", tokenCheck);
    }
    
    // If not found, try as string (workaround for some Postgres implementations)
    if (!tokenCheck) {
      console.log("Intentando verificar token como texto...");
      const { data: textTokenCheck, error: textTokenError } = await supabase
        .from("user_invitations")
        .select("id, invitation_token")
        .eq("invitation_token::text", token)
        .maybeSingle();
        
      if (textTokenError) {
        console.error("Error verificando token como texto:", textTokenError);
      } else {
        console.log("Verificación de token como texto:", textTokenCheck ? "Encontrado" : "No encontrado");
        console.log("Detalles del token encontrado (como texto):", textTokenCheck);
      }
    }
  } catch (error) {
    console.error("Error inesperado verificando token:", error);
  }
}
