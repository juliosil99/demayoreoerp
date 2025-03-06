
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
  invitationToken?: string;
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
    
    const { email, password, role, invitationToken }: CreateUserRequest = requestBody;
    
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
    
    // Verify the invitation token if provided
    if (invitationToken) {
      console.log("Verifying invitation token:", invitationToken);
      
      const { data: invitation, error: invitationError } = await supabaseAdmin
        .from('user_invitations')
        .select('*')
        .eq('invitation_token', invitationToken)
        .eq('email', email)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (invitationError) {
        console.error("Error verifying invitation:", invitationError);
        return new Response(
          JSON.stringify({ 
            error: "Failed to verify invitation", 
            details: invitationError.message 
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
      
      if (!invitation) {
        console.error("Invalid or expired invitation token");
        return new Response(
          JSON.stringify({ 
            error: "Invalid or expired invitation" 
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
      
      console.log("Invitation verified successfully");
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
        // Get the user data for the already registered user
        // Fix: Use the correct method to get user by email
        const { data: existingUserData, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({
          filter: {
            email: email
          }
        });
        
        let existingUser = null;
        if (existingUserData && existingUserData.users && existingUserData.users.length > 0) {
          existingUser = existingUserData.users[0];
        }
        
        if (getUserError) {
          console.error("Error fetching existing user:", getUserError);
        } else if (existingUser) {
          // Check if user already has a role
          const { data: existingRole } = await supabaseAdmin
            .from('user_roles')
            .select('*')
            .eq('user_id', existingUser.id)
            .maybeSingle();
            
          // If no role exists, create one
          if (!existingRole) {
            console.log("Setting role for existing user:", existingUser.id);
            const { error: roleError } = await supabaseAdmin
              .from('user_roles')
              .insert({
                user_id: existingUser.id,
                role
              });
              
            if (roleError) {
              console.error("Error setting role for existing user:", roleError);
            }
          }
        }
        
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
    
    // Add user to the appropriate role - ENSURE this always runs
    if (role) {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role
        });
        
      if (roleError) {
        console.error("Error setting user role:", roleError);
        // Log error but continue the process
        console.log("Will attempt to continue despite role error");
      } else {
        console.log("User role set successfully to:", role);
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
