
export async function verifyForecast(supabaseClient: any, forecastId: string) {
  console.log("[DEBUG - Edge Function] Verifying forecast exists:", forecastId);
  const { data: forecastData, error: forecastError } = await supabaseClient
    .from("cash_flow_forecasts")
    .select("id, start_date")
    .eq("id", forecastId)
    .single();
  
  if (forecastError || !forecastData) {
    console.error("[DEBUG - Edge Function] Error retrieving forecast:", forecastError);
    return null;
  }

  return forecastData;
}
