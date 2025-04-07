import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get OpenAI API key from our secure storage
    const { data: keyData, error: keyError } = await supabaseClient
      .from('api_keys')
      .select('key_value')
      .eq('key_name', 'OPENAI_API_KEY')
      .single();

    if (keyError || !keyData?.key_value) {
      console.error("Error retrieving OpenAI API key:", keyError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "OpenAI API key not found. Please set up your OpenAI API key first."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiApiKey = keyData.key_value;

    // Parse request body
    const { forecastId, startDate, historicalData, config } = await req.json();
    
    // Implement your forecast generation logic here using OpenAI API...
    // ...

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Forecast generated successfully",
        // Include other data as needed
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating forecast:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unexpected error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
