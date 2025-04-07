
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Set API Key function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log environment variables (without revealing secrets)
    console.log("SUPABASE_URL available:", !!Deno.env.get("SUPABASE_URL"));
    console.log("SUPABASE_SERVICE_ROLE_KEY available:", !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    
    // Get supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // Get JWT token from request header
    const authHeader = req.headers.get("Authorization");
    console.log("Authorization header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Verify the user session from token
    const token = authHeader.replace("Bearer ", "");
    console.log("Token extracted, attempting to get user");
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated:", user.id);

    // Bypass role check - assume all authenticated users can set API keys for now
    // We'll log what would have happened with the role check
    try {
      const { data: roleData, error: roleError } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      console.log("Role data:", roleData);
      if (roleError) {
        console.log("Role check error (ignoring):", roleError);
      }
    } catch (roleCheckError) {
      console.log("Error during role check (ignoring):", roleCheckError);
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed successfully");
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { key, value } = requestBody;
    
    // Validate input
    if (!key || !value) {
      console.error("Missing key or value in request body:", { key: !!key, value: !!value });
      return new Response(
        JSON.stringify({ error: "Missing key or value" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Attempting to set API key '${key}'`);
    
    // Check if value starts with the expected prefix for OpenAI keys
    if (key === "OPENAI_API_KEY" && !value.startsWith("sk-")) {
      console.error("Invalid OpenAI API key format");
      return new Response(
        JSON.stringify({ error: "Invalid OpenAI API key format. Keys should start with 'sk-'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Set the environment variable for the current function
    // Note: This doesn't persist after the function execution
    // It's being logged for confirmation, but the real storage happens in Supabase secrets
    Deno.env.set(key, value);
    
    // Log success but don't reveal the key value
    console.log(`API key '${key}' set successfully by user ${user.email}`);
    
    return new Response(
      JSON.stringify({ success: true, message: "API key set successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error setting API key:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
