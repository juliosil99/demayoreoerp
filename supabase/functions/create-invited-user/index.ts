
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Edge function called with method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Creating Supabase client with URL:", supabaseUrl ? "URL exists" : "URL missing");
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error: Missing environment variables" 
        }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed successfully");
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request body format",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error" 
        }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }
    
    const { email, password, role }: CreateUserRequest = requestBody;
    
    console.log(`Creating user with email: ${email}, role: ${role}`);
    
    if (!email || !password) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }
    
    // Create the user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role }
    });
    
    if (createError) {
      console.error("Error creating user:", createError);
      
      // Special handling for already registered users
      if (createError.message.includes("already been registered")) {
        return new Response(
          JSON.stringify({ 
            error: "User already exists", 
            message: createError.message,
            code: "USER_EXISTS"
          }),
          { 
            status: 409, 
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders 
            } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: createError.message,
          details: createError
        }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }
    
    if (!userData || !userData.user) {
      console.error("User creation succeeded but no user data returned");
      return new Response(
        JSON.stringify({ 
          error: "Unknown error: User creation succeeded but no user data returned" 
        }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders 
          } 
        }
      );
    }
    
    console.log("User created successfully, adding role");
    
    // Add user to the appropriate role
    if (role) {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role
        });
        
      if (roleError) {
        console.error("Error setting user role:", roleError);
        // Log error but don't fail the process
      }
    }
    
    console.log("Returning successful response");
    
    return new Response(
      JSON.stringify({ 
        user: userData.user,
        message: "User created successfully" 
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
};

serve(handler);
