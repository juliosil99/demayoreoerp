
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { corsHeaders } from "./helpers/corsHeaders.ts";
import { handleForecastGeneration } from "./controllers/forecastController.ts";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("[DEBUG - Edge Function] Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[DEBUG - Edge Function] Starting cash-flow-forecast processing");
  
  try {
    console.log("[DEBUG - Edge Function] Creating Supabase client");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    return await handleForecastGeneration(req, supabaseClient);
  } catch (error) {
    console.error("[DEBUG - Edge Function] Error generating forecast:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unexpected error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
