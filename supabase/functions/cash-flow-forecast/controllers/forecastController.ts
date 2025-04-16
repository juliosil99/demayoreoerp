
import { corsHeaders } from "../helpers/corsHeaders.ts";
import { getOpenAIApiKey } from "../services/apiKeyService.ts";
import { verifyForecast } from "../services/forecastService.ts";
import { generateAIInsights } from "../services/aiService.ts";
import { updateForecastWithInsights, createOrUpdateForecastWeeks } from "../services/databaseService.ts";
import { format } from "https://esm.sh/date-fns@4.1.0";

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
      netPosition: requestBody.historicalData?.netPosition,
      balanceHistoryEntries: requestBody.historicalData?.balance_history?.length
    }));
    
    console.log("[DEBUG - Edge Function] Detailed data counts:", {
      payables: requestBody.historicalData?.payables?.length || 0,
      receivables: requestBody.historicalData?.receivables?.length || 0,
      expenses: requestBody.historicalData?.expenses?.length || 0,
      sales: requestBody.historicalData?.sales?.length || 0,
      creditPayments: requestBody.historicalData?.upcomingCreditPayments?.length || 0,
    });
    
    console.log("[DEBUG - Edge Function - AI Config]", 
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
  const balanceHistory = historicalData.balance_history || [];
  
  console.log("[DEBUG - Edge Function - Financial Data] Financial balances:", {
    availableCashBalance,
    creditLiabilities,
    netPosition,
    upcomingCreditPaymentsCount: upcomingCreditPayments.length,
    balanceHistoryEntries: balanceHistory.length
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
    
    console.log("[DEBUG - Edge Function] AI insights generated, forecast predictions count:", 
      forecastPredictions.length
    );
    
    // Print a sample of the predictions (first 2 weeks)
    if (forecastPredictions.length > 0) {
      console.log("[DEBUG - Edge Function] Sample predictions:", 
        JSON.stringify(forecastPredictions.slice(0, 2), null, 2)
      );
    }
  } else {
    console.log("[DEBUG - Edge Function] Skipping AI insights generation - AI disabled or no API key");
    insights = "AI-powered insights were not enabled for this forecast.";
  }
  
  // Prepare additional data for rolling forecast
  const now = new Date();
  const lastReconciledDate = config?.reconcileBalances ? format(now, 'yyyy-MM-dd') : undefined;
  const isBalanceConfirmed = config?.reconcileBalances || false;
  
  // Update the forecast with AI insights and financial balances
  const updateError = await updateForecastWithInsights(
    supabaseClient,
    forecastId,
    insights,
    config,
    availableCashBalance,
    creditLiabilities,
    netPosition,
    lastReconciledDate,
    isBalanceConfirmed
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
  
  console.log("[DEBUG - Edge Function - Forecast Weeks] Before creating forecast weeks:", {
    startDate: forecastStartDate.toISOString(),
    availableCashBalance,
    startWithCurrentBalance: config?.startWithCurrentBalance,
    useRollingForecast: config?.useRollingForecast,
    forecastPredictionsCount: forecastPredictions.length
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
