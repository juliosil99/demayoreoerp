
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("Get API Key function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    
    // Parse request to get the key name
    const url = new URL(req.url);
    const keyName = url.searchParams.get("key");
    
    if (!keyName) {
      return new Response(
        JSON.stringify({ error: "Missing key parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Retrieve the API key from the database
    const { data: keyData, error: keyError } = await supabaseClient
      .from('api_keys')
      .select('key_value')
      .eq('key_name', keyName)
      .single();
    
    if (keyError) {
      console.error("Error retrieving API key:", keyError);
      return new Response(
        JSON.stringify({ error: "API key not found", details: keyError.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!keyData) {
      return new Response(
        JSON.stringify({ error: "API key not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Return the API key value
    return new Response(
      JSON.stringify({ success: true, value: keyData.key_value }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting API key:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
