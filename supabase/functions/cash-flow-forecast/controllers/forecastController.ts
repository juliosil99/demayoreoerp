
import { corsHeaders } from "../helpers/corsHeaders.ts";
import { getOpenAIApiKey } from "../services/apiKeyService.ts";
import { verifyForecast } from "../services/forecastService.ts";
import { generateAIInsights } from "../services/aiService.ts";
import { updateForecastWithInsights, createOrUpdateForecastWeeks } from "../services/databaseService.ts";

export async function handleForecastGeneration(req: Request, supabaseClient: any) {
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
      availableCashBalance: requestBody.historicalData?.availableCashBalance,
      creditLiabilities: requestBody.historicalData?.creditLiabilities,
      netPosition: requestBody.historicalData?.netPosition
    }));
    
    console.log("[DEBUG - Edge Function - Balance Tracking] Detailed config:", 
      JSON.stringify(requestBody.config, null, 2)
    );
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
  const forecastData = await verifyForecast(supabaseClient, forecastId);
  
  if (!forecastData) {
    return new Response(
      JSON.stringify({ success: false, error: "Forecast not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  console.log("[DEBUG - Edge Function] Forecast verified:", forecastData.id);
  
  // Get available cash balance, credit liabilities, and net position
  const availableCashBalance = historicalData.availableCashBalance || 0;
  const creditLiabilities = historicalData.creditLiabilities || 0;
  const netPosition = historicalData.netPosition || 0;
  const upcomingCreditPayments = historicalData.upcomingCreditPayments || [];
  
  console.log("[DEBUG - Edge Function - Balance Tracking] Financial balances:", {
    availableCashBalance,
    creditLiabilities,
    netPosition,
    upcomingCreditPaymentsCount: upcomingCreditPayments.length
  });
  
  // Generate AI insights based on historical data
  let insights = "";
  let forecastPredictions = [];
  
  if (config?.useAI) {
    // Retrieve OpenAI API key
    const openaiApiKey = await getOpenAIApiKey(supabaseClient);
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "OpenAI API key not found. Please set up your OpenAI API key first."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Generate AI insights
    const aiResponse = await generateAIInsights(
      historicalData, 
      config, 
      openaiApiKey, 
      availableCashBalance,
      creditLiabilities,
      netPosition,
      upcomingCreditPayments
    );
    
    insights = aiResponse.insights;
    forecastPredictions = aiResponse.weeklyForecasts || [];
  } else {
    console.log("[DEBUG - Edge Function] Skipping AI insights generation - AI disabled or no API key");
    insights = "AI-powered insights were not enabled for this forecast.";
  }
  
  // Update the forecast with AI insights and financial balances
  const updateError = await updateForecastWithInsights(
    supabaseClient,
    forecastId,
    insights,
    config,
    availableCashBalance,
    creditLiabilities,
    netPosition
  );
  
  if (updateError) {
    return new Response(
      JSON.stringify({ success: false, error: "Failed to update forecast with AI insights" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Create or update forecast weeks
  const forecastStartDate = new Date(startDate || forecastData.start_date);
  const forecastHorizonWeeks = config?.forecastHorizonWeeks || 13; // Default to 13 weeks if not specified
  
  console.log("[DEBUG - Edge Function - Balance Tracking] Before creating forecast weeks:", {
    startDate: forecastStartDate.toISOString(),
    availableCashBalance,
    startWithCurrentBalance: config?.startWithCurrentBalance
  });
  
  const weeksResult = await createOrUpdateForecastWeeks(
    supabaseClient,
    forecastId,
    forecastStartDate,
    forecastHorizonWeeks,
    forecastPredictions,
    historicalData,
    config,
    availableCashBalance
  );
  
  if (!weeksResult.success) {
    return new Response(
      JSON.stringify({ success: false, error: weeksResult.error }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Return success response
  return new Response(
    JSON.stringify({
      success: true,
      message: "Forecast generated successfully",
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
