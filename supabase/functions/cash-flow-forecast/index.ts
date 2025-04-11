
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { addDays, format } from "https://esm.sh/date-fns@4.1.0";

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

  console.log("[DEBUG - Edge Function] Starting cash-flow-forecast processing");
  
  try {
    console.log("[DEBUG - Edge Function] Creating Supabase client");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get OpenAI API key from our secure storage
    console.log("[DEBUG - Edge Function] Retrieving OpenAI API key");
    const { data: keyData, error: keyError } = await supabaseClient
      .from('api_keys')
      .select('key_value')
      .eq('key_name', 'OPENAI_API_KEY')
      .single();

    if (keyError || !keyData?.key_value) {
      console.error("[DEBUG - Edge Function] Error retrieving OpenAI API key:", keyError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "OpenAI API key not found. Please set up your OpenAI API key first."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[DEBUG - Edge Function] OpenAI API key retrieved successfully");
    const openaiApiKey = keyData.key_value;

    // Parse request body
    console.log("[DEBUG - Edge Function] Parsing request body");
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("[DEBUG - Edge Function] Request body parsed:", JSON.stringify({
        forecastId: requestBody.forecastId,
        hasStartDate: !!requestBody.startDate,
        hasHistoricalData: !!requestBody.historicalData,
        hasConfig: !!requestBody.config,
      }));
    } catch (e) {
      console.error("[DEBUG - Edge Function] Error parsing JSON:", e);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { forecastId, startDate, historicalData, config } = requestBody;
    
    if (!forecastId) {
      console.error("[DEBUG - Edge Function] Missing forecastId parameter");
      return new Response(
        JSON.stringify({ success: false, error: "Missing forecastId parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the forecast exists
    console.log("[DEBUG - Edge Function] Verifying forecast exists:", forecastId);
    const { data: forecastData, error: forecastError } = await supabaseClient
      .from("cash_flow_forecasts")
      .select("id, start_date")
      .eq("id", forecastId)
      .single();
    
    if (forecastError || !forecastData) {
      console.error("[DEBUG - Edge Function] Error retrieving forecast:", forecastError);
      return new Response(
        JSON.stringify({ success: false, error: "Forecast not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[DEBUG - Edge Function] Forecast verified:", forecastData.id);
    
    // Generate a simple mock forecast for now (this would be replaced with actual OpenAI integration)
    console.log("[DEBUG - Edge Function] Generating mock insights");
    const mockInsights = "Based on your historical data, your cash flow is projected to increase by approximately 5% over the next quarter. Consider reserving funds in week 7 for expected seasonal expenses.";
    
    // Update the forecast with AI insights
    console.log("[DEBUG - Edge Function] Updating forecast with AI insights");
    const { error: updateError } = await supabaseClient
      .from("cash_flow_forecasts")
      .update({ 
        ai_insights: mockInsights,
        status: "active"
      })
      .eq("id", forecastId);

    if (updateError) {
      console.error("[DEBUG - Edge Function] Error updating forecast with AI insights:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to update forecast with AI insights" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if forecast weeks exist already
    console.log("[DEBUG - Edge Function] Retrieving forecast weeks");
    const { data: existingWeeks, error: weeksError } = await supabaseClient
      .from("forecast_weeks")
      .select("id, week_number")
      .eq("forecast_id", forecastId)
      .order("week_number", { ascending: true });

    if (weeksError) {
      console.error("[DEBUG - Edge Function] Error retrieving forecast weeks:", weeksError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to retrieve forecast weeks" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[DEBUG - Edge Function] Retrieved weeks:", existingWeeks.length);
    
    // If no weeks exist, create them
    if (existingWeeks.length === 0) {
      console.log("[DEBUG - Edge Function] No forecast weeks found. Creating 13 weeks...");
      
      // Parse the start date from the forecast
      const forecastStartDate = new Date(startDate || forecastData.start_date);
      
      // Create 13 weeks
      const weeksToCreate = Array.from({ length: 13 }, (_, i) => {
        const weekStart = addDays(forecastStartDate, i * 7);
        const weekEnd = addDays(weekStart, 6);
        
        // Add some variation for the forecast
        const growthFactor = 1 + (i * 0.01); // Small growth each week
        const randomVariation = 0.9 + (Math.random() * 0.2); // +/- 10% random variation
        const baseInflow = 10000; // Base weekly inflow
        const baseOutflow = 8000;  // Base weekly outflow
        
        return {
          forecast_id: forecastId,
          week_number: i + 1,
          week_start_date: format(weekStart, 'yyyy-MM-dd'),
          week_end_date: format(weekEnd, 'yyyy-MM-dd'),
          predicted_inflows: Math.round(baseInflow * growthFactor * randomVariation),
          predicted_outflows: Math.round(baseOutflow * (1 + (i * 0.005)) * randomVariation),
          confidence_score: Math.round((0.8 - (i * 0.02)) * 100) / 100 // Confidence decreases with time
        };
      });
      
      console.log("[DEBUG - Edge Function] Inserting weeks:", weeksToCreate.length);
      
      const { error: insertError } = await supabaseClient
        .from("forecast_weeks")
        .insert(weeksToCreate);
        
      if (insertError) {
        console.error("[DEBUG - Edge Function] Error creating forecast weeks:", insertError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to create forecast weeks" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("[DEBUG - Edge Function] Successfully created forecast weeks");
      
      // Fetch the newly created weeks to update them with forecast data
      const { data: newWeeks, error: newWeeksError } = await supabaseClient
        .from("forecast_weeks")
        .select("id, week_number")
        .eq("forecast_id", forecastId)
        .order("week_number", { ascending: true });
        
      if (newWeeksError || !newWeeks) {
        console.error("[DEBUG - Edge Function] Error fetching new weeks:", newWeeksError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to fetch newly created weeks" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Use the newly created weeks for the following updates
      console.log("[DEBUG - Edge Function] Using newly created weeks for forecast data");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Forecast generated successfully",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If weeks already exist, update them with forecast data
    console.log("[DEBUG - Edge Function] Updating weeks with forecast data");
    
    // Update each week with some forecast data
    const baseInflow = 10000; // Base weekly inflow
    const baseOutflow = 8000;  // Base weekly outflow
    const weekUpdates = existingWeeks.map((week, index) => {
      // Add some variation for the forecast
      const growthFactor = 1 + (index * 0.01); // Small growth each week
      const randomVariation = 0.9 + (Math.random() * 0.2); // +/- 10% random variation
      
      return {
        id: week.id,
        predicted_inflows: Math.round(baseInflow * growthFactor * randomVariation),
        predicted_outflows: Math.round(baseOutflow * (1 + (index * 0.005)) * randomVariation),
        confidence_score: 0.8 - (index * 0.02)  // Confidence decreases with time
      };
    });
    
    // Update all weeks with transaction
    for (const weekUpdate of weekUpdates) {
      console.log("[DEBUG - Edge Function] Updating week:", weekUpdate.id);
      const { error } = await supabaseClient
        .from("forecast_weeks")
        .update({
          predicted_inflows: weekUpdate.predicted_inflows,
          predicted_outflows: weekUpdate.predicted_outflows,
          confidence_score: weekUpdate.confidence_score
        })
        .eq("id", weekUpdate.id);

      if (error) {
        console.error(`[DEBUG - Edge Function] Error updating week ${weekUpdate.id}:`, error);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to update forecast weeks" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log("[DEBUG - Edge Function] Successfully updated all weeks");
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Forecast generated successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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
