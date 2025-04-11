
import { generateForecastWeeks } from "../helpers/forecastGenerator.ts";

export async function updateForecastWithInsights(
  supabaseClient: any,
  forecastId: string,
  insights: string,
  config: any,
  availableCashBalance: number,
  creditLiabilities: number,
  netPosition: number
) {
  console.log("[DEBUG - Edge Function] Updating forecast with AI insights and financial balances");
  const { error: updateError } = await supabaseClient
    .from("cash_flow_forecasts")
    .update({ 
      ai_insights: insights,
      status: "active",
      config: config || {},
      initial_balance: availableCashBalance, // For backward compatibility
      available_cash_balance: availableCashBalance,
      credit_liabilities: creditLiabilities,
      net_position: netPosition
    })
    .eq("id", forecastId);

  if (updateError) {
    console.error("[DEBUG - Edge Function] Error updating forecast with AI insights:", updateError);
    return updateError;
  }
  
  return null;
}

export async function createOrUpdateForecastWeeks(
  supabaseClient: any,
  forecastId: string,
  forecastStartDate: Date,
  forecastHorizonWeeks: number,
  forecastPredictions: any[],
  historicalData: any,
  config: any,
  availableCashBalance: number
) {
  // Check if forecast weeks exist already
  console.log("[DEBUG - Edge Function] Retrieving forecast weeks");
  const { data: existingWeeks, error: weeksError } = await supabaseClient
    .from("forecast_weeks")
    .select("id, week_number")
    .eq("forecast_id", forecastId)
    .order("week_number", { ascending: true });

  if (weeksError) {
    console.error("[DEBUG - Edge Function] Error retrieving forecast weeks:", weeksError);
    return { success: false, error: "Failed to retrieve forecast weeks" };
  }

  console.log("[DEBUG - Edge Function] Retrieved weeks:", existingWeeks.length);
  
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
      config,
      availableCashBalance
    );
    
    console.log("[DEBUG - Edge Function] Inserting weeks:", weeksToCreate.length);
    
    const { error: insertError } = await supabaseClient
      .from("forecast_weeks")
      .insert(weeksToCreate);
      
    if (insertError) {
      console.error("[DEBUG - Edge Function] Error creating forecast weeks:", insertError);
      return { success: false, error: "Failed to create forecast weeks" };
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
      config,
      availableCashBalance
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
          week_end_date: weekUpdate.week_end_date,
          starting_balance: weekUpdate.starting_balance,
          ending_balance: weekUpdate.ending_balance
        })
        .eq("id", existingWeek.id);

      if (error) {
        console.error(`[DEBUG - Edge Function] Error updating week ${existingWeek.id}:`, error);
        return { success: false, error: "Failed to update forecast weeks" };
      }
    }

    console.log("[DEBUG - Edge Function] Successfully updated all weeks");
  }
  
  return { success: true };
}
