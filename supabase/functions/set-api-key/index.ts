
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("[DEBUG - Edge Function] Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[DEBUG - Edge Function] Starting set-api-key processing");

  try {
    // Create supabase client
    console.log("[DEBUG - Edge Function] Creating Supabase client");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // Get auth user
    console.log("[DEBUG - Edge Function] Getting auth user from token");
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      console.error("[DEBUG - Edge Function] No authorization token provided");
      return new Response(
        JSON.stringify({ success: false, error: "No authorization token provided" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("[DEBUG - Edge Function] Invalid token or user not found:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid token or user not found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("[DEBUG - Edge Function] User authenticated:", userData.user.id);
    
    // Parse request body
    console.log("[DEBUG - Edge Function] Parsing request body");
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("[DEBUG - Edge Function] Request body parsed successfully");
    } catch (e) {
      console.error("[DEBUG - Edge Function] Error parsing JSON:", e);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { apiKey } = requestBody;
    
    if (!apiKey) {
      console.error("[DEBUG - Edge Function] No API key provided");
      return new Response(
        JSON.stringify({ success: false, error: "API key is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if OpenAI API key already exists
    console.log("[DEBUG - Edge Function] Checking if API key already exists");
    const { data: existingKey, error: existingKeyError } = await supabaseClient
      .from('api_keys')
      .select('id')
      .eq('key_name', 'OPENAI_API_KEY')
      .single();

    let result;
    if (existingKey) {
      // Update existing key
      console.log("[DEBUG - Edge Function] Updating existing API key");
      result = await supabaseClient
        .from('api_keys')
        .update({ key_value: apiKey, updated_at: new Date().toISOString() })
        .eq('key_name', 'OPENAI_API_KEY');
    } else {
      // Insert new key
      console.log("[DEBUG - Edge Function] Inserting new API key");
      result = await supabaseClient
        .from('api_keys')
        .insert({
          key_name: 'OPENAI_API_KEY',
          key_value: apiKey,
          created_by: userData.user.id
        });
    }

    if (result.error) {
      console.error("[DEBUG - Edge Function] Error saving API key:", result.error);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save API key" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[DEBUG - Edge Function] API key saved successfully");
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "API key saved successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[DEBUG - Edge Function] Error in set-api-key:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unexpected error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
