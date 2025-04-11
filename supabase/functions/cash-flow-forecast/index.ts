
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
    
    // Generate AI insights based on historical data
    let insights = "";
    let forecastPredictions = [];
    
    if (config?.useAI && openaiApiKey) {
      console.log("[DEBUG - Edge Function] Generating AI insights with OpenAI");
      
      // Prepare historical data summary for OpenAI
      const historicalSummary = {
        payables: summarizeFinancialData(historicalData.payables),
        receivables: summarizeFinancialData(historicalData.receivables),
        expenses: summarizeFinancialData(historicalData.expenses),
        sales: summarizeFinancialData(historicalData.sales),
        bankAccounts: historicalData.bankAccounts.map(acc => ({
          name: acc.name,
          balance: acc.balance,
          currency: acc.currency
        }))
      };
      
      // Create prompt for OpenAI with configuration options
      const prompt = createAIPrompt(historicalSummary, config);
      
      try {
        // Call OpenAI API
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a financial forecasting AI assistant. Your task is to analyze financial data and provide cash flow forecasts and insights."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            response_format: { type: "json_object" }
          })
        });
        
        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error("[DEBUG - Edge Function] OpenAI API error:", errorText);
          throw new Error(`OpenAI API error: ${errorText}`);
        }
        
        const aiData = await aiResponse.json();
        console.log("[DEBUG - Edge Function] OpenAI response received");
        
        // Parse the AI response
        try {
          const parsedResponse = JSON.parse(aiData.choices[0].message.content);
          insights = parsedResponse.insights || "AI analysis completed, but no specific insights were provided.";
          forecastPredictions = parsedResponse.weeklyForecasts || [];
          
          console.log("[DEBUG - Edge Function] AI insights generated successfully");
        } catch (parseError) {
          console.error("[DEBUG - Edge Function] Error parsing AI response:", parseError);
          insights = "AI analysis completed, but there was an error processing the results.";
          // Continue with fallback forecasting
        }
      } catch (aiError) {
        console.error("[DEBUG - Edge Function] Error calling OpenAI:", aiError);
        insights = "Unable to generate AI-powered insights. Falling back to statistical forecasting.";
        // Continue with fallback forecasting
      }
    } else {
      console.log("[DEBUG - Edge Function] Skipping AI insights generation - AI disabled or no API key");
      insights = "AI-powered insights were not enabled for this forecast.";
    }
    
    // Update the forecast with AI insights
    console.log("[DEBUG - Edge Function] Updating forecast with AI insights");
    const { error: updateError } = await supabaseClient
      .from("cash_flow_forecasts")
      .update({ 
        ai_insights: insights,
        status: "active",
        config: config || {}
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
    
    // Generate forecast weeks - either use AI predictions or fallback to statistical model
    const forecastStartDate = new Date(startDate || forecastData.start_date);
    const forecastHorizonWeeks = config?.forecastHorizonWeeks || 13; // Default to 13 weeks if not specified
    
    // If no weeks exist, create them
    if (existingWeeks.length === 0) {
      console.log("[DEBUG - Edge Function] No forecast weeks found. Creating weeks...");
      
      // Use AI predictions if available, otherwise use statistical model
      const weeksToCreate = generateForecastWeeks(
        forecastId,
        forecastStartDate,
        forecastHorizonWeeks,
        forecastPredictions,
        historicalData,
        config
      );
      
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
    } else {
      // If weeks already exist, update them with new forecast data
      console.log("[DEBUG - Edge Function] Updating weeks with forecast data");
      
      // Generate updated forecast data
      const weekUpdates = generateForecastWeeks(
        forecastId,
        forecastStartDate,
        existingWeeks.length,
        forecastPredictions,
        historicalData,
        config
      );
      
      // Update all weeks
      for (let i = 0; i < existingWeeks.length && i < weekUpdates.length; i++) {
        const weekUpdate = weekUpdates[i];
        const existingWeek = existingWeeks[i];
        
        console.log(`[DEBUG - Edge Function] Updating week ${existingWeek.week_number}`);
        
        const { error } = await supabaseClient
          .from("forecast_weeks")
          .update({
            predicted_inflows: weekUpdate.predicted_inflows,
            predicted_outflows: weekUpdate.predicted_outflows,
            confidence_score: weekUpdate.confidence_score,
            week_start_date: weekUpdate.week_start_date,
            week_end_date: weekUpdate.week_end_date
          })
          .eq("id", existingWeek.id);

        if (error) {
          console.error(`[DEBUG - Edge Function] Error updating week ${existingWeek.id}:`, error);
          return new Response(
            JSON.stringify({ success: false, error: "Failed to update forecast weeks" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      console.log("[DEBUG - Edge Function] Successfully updated all weeks");
    }
    
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

// Helper function to create AI prompt based on historical data and configuration
function createAIPrompt(historicalData, config) {
  return `
Please analyze the following financial data and provide a 13-week cash flow forecast with insights.

HISTORICAL FINANCIAL DATA SUMMARY:
${JSON.stringify(historicalData, null, 2)}

CONFIGURATION OPTIONS:
- Include Historical Trends: ${config.includeHistoricalTrends ? 'Yes' : 'No'}
- Include Seasonality: ${config.includeSeasonality ? 'Yes' : 'No'}
- Include Pending Payables: ${config.includePendingPayables ? 'Yes' : 'No'}
- Include Recurring Expenses: ${config.includeRecurringExpenses ? 'Yes' : 'No'}
- Forecast Horizon Weeks: ${config.forecastHorizonWeeks || 13}

Please provide the following in JSON format:
1. "insights": A detailed analysis of the cash flow forecast, with key observations and recommendations.
2. "weeklyForecasts": An array of weekly forecasts with the following structure for each week:
   - weekNumber: The week number (1-13)
   - predictedInflows: Predicted cash inflows for the week
   - predictedOutflows: Predicted cash outflows for the week
   - confidenceScore: A confidence score between 0-1 for the prediction

Your response should be valid JSON with "insights" and "weeklyForecasts" keys.
`;
}

// Helper function to summarize financial data
function summarizeFinancialData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return { count: 0, total: 0, average: 0 };
  }
  
  let total = 0;
  let count = data.length;
  
  // Sum up amounts, handling different property names
  data.forEach(item => {
    const amount = item.amount || item.price || item.total_amount || 0;
    total += Number(amount) || 0;
  });
  
  return {
    count,
    total,
    average: count > 0 ? total / count : 0,
    // Include the first 5 items for reference
    recentItems: data.slice(0, 5).map(item => ({
      date: item.date || item.due_date || item.created_at || 'unknown',
      amount: item.amount || item.price || item.total_amount || 0,
      description: item.description || item.notes || ''
    }))
  };
}

// Helper function to generate forecast weeks
function generateForecastWeeks(forecastId, startDate, numWeeks, aiPredictions, historicalData, config) {
  const weeks = [];
  
  // Calculate base values from historical data
  const historicalPayables = calculateAverageAmount(historicalData.payables);
  const historicalReceivables = calculateAverageAmount(historicalData.receivables);
  const historicalExpenses = calculateAverageAmount(historicalData.expenses);
  const historicalSales = calculateAverageAmount(historicalData.sales);
  
  // Base weekly values
  const baseInflow = historicalReceivables + historicalSales > 0 
    ? historicalReceivables + historicalSales 
    : 10000; // Fallback if no historical data
    
  const baseOutflow = historicalPayables + historicalExpenses > 0
    ? historicalPayables + historicalExpenses
    : 8000;  // Fallback if no historical data

  for (let i = 0; i < numWeeks; i++) {
    const weekNumber = i + 1;
    const weekStart = addDays(startDate, i * 7);
    const weekEnd = addDays(weekStart, 6);
    
    // Check if we have AI prediction for this week
    const aiPrediction = aiPredictions.find(p => p.weekNumber === weekNumber);
    
    let predictedInflows, predictedOutflows, confidenceScore;
    
    if (aiPrediction) {
      // Use AI predictions if available
      predictedInflows = aiPrediction.predictedInflows;
      predictedOutflows = aiPrediction.predictedOutflows;
      confidenceScore = aiPrediction.confidenceScore;
    } else {
      // Fall back to statistical model
      
      // Add some variation and trends
      const growthFactor = config?.includeHistoricalTrends 
        ? 1 + (i * 0.01) // Small growth each week
        : 1;
        
      // Add seasonal variation if configured
      const seasonalFactor = config?.includeSeasonality 
        ? 1 + (0.1 * Math.sin(i * Math.PI / 6)) // Sine wave over approximately 3 months
        : 1;
        
      // Add random variation
      const randomVariation = 0.9 + (Math.random() * 0.2); // +/- 10% random variation
      
      predictedInflows = Math.round(baseInflow * growthFactor * seasonalFactor * randomVariation);
      
      // Adjust outflows based on configuration
      let outflowAdjustment = 1;
      if (config?.includePendingPayables && historicalData.payables.length > 0) {
        outflowAdjustment *= 1.05; // Increase outflows by 5% if including pending payables
      }
      if (config?.includeRecurringExpenses && historicalData.expenses.length > 0) {
        outflowAdjustment *= 1.03; // Increase outflows by 3% if including recurring expenses
      }
      
      predictedOutflows = Math.round(baseOutflow * (1 + (i * 0.005)) * seasonalFactor * randomVariation * outflowAdjustment);
      
      // Confidence decreases with time and is higher with more historical data
      const dataFactor = Math.min(1, (historicalData.payables.length + historicalData.receivables.length + 
                                    historicalData.expenses.length + historicalData.sales.length) / 40);
      confidenceScore = Math.round((0.9 - (i * 0.02)) * dataFactor * 100) / 100;
    }
    
    weeks.push({
      forecast_id: forecastId,
      week_number: weekNumber,
      week_start_date: format(weekStart, 'yyyy-MM-dd'),
      week_end_date: format(weekEnd, 'yyyy-MM-dd'),
      predicted_inflows: predictedInflows,
      predicted_outflows: predictedOutflows,
      confidence_score: confidenceScore
    });
  }
  
  return weeks;
}

// Helper function to calculate average amount from financial data
function calculateAverageAmount(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }
  
  let total = 0;
  let count = 0;
  
  data.forEach(item => {
    const amount = Number(item.amount || item.price || item.total_amount || 0);
    if (amount > 0) {
      total += amount;
      count++;
    }
  });
  
  return count > 0 ? total / count : 0;
}
