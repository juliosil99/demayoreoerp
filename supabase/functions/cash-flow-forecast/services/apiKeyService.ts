
export async function getOpenAIApiKey(supabaseClient: any): Promise<string | null> {
  console.log("[DEBUG - Edge Function] Retrieving OpenAI API key");
  const { data: keyData, error: keyError } = await supabaseClient
    .from('api_keys')
    .select('key_value')
    .eq('key_name', 'OPENAI_API_KEY')
    .single();

  if (keyError || !keyData?.key_value) {
    console.error("[DEBUG - Edge Function] Error retrieving OpenAI API key:", keyError);
    return null;
  }

  console.log("[DEBUG - Edge Function] OpenAI API key retrieved successfully");
  return keyData.key_value;
}
