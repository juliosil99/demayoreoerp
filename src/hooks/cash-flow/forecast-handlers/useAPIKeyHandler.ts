
import { toast } from "sonner";

interface APIKeyHandlerProps {
  SUPABASE_URL: string;
}

export function useAPIKeyHandler({
  SUPABASE_URL
}: APIKeyHandlerProps) {
  
  const handleSaveOpenAIKey = async (apiKey: string) => {
    console.log("[DEBUG] useForecastOperations - Saving OpenAI API Key");
    try {
      // Get auth session for API call
      const { supabase } = await import("@/lib/supabase");
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      
      if (!accessToken) {
        console.error("[DEBUG] useForecastOperations - No access token available");
        throw new Error("Authentication token not available");
      }
      
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/set-api-key`;
      console.log("[DEBUG] useForecastOperations - Calling edge function:", edgeFunctionUrl);
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ apiKey })
      });
      
      console.log("[DEBUG] useForecastOperations - Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DEBUG] useForecastOperations - API Error Response:", errorText);
        throw new Error(`Failed to save API key: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("[DEBUG] useForecastOperations - API Response:", data);
      
      if (!data.success) {
        console.error("[DEBUG] useForecastOperations - API Error:", data.error);
        throw new Error(data.error || 'Unknown error saving API key');
      }
      
      toast.success('API Key guardada correctamente');
      return true;
    } catch (error) {
      console.error('[DEBUG] useForecastOperations - Error saving API key:', error);
      toast.error(`Error al guardar API key: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return false;
    }
  };

  return { handleSaveOpenAIKey };
}
