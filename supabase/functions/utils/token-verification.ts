
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Helper function to verify a token in multiple ways
 */
export async function verifyInvitationToken(token: string, supabaseUrl: string, supabaseKey: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log("Verifying token with multiple approaches:", token);
  
  // Try direct UUID comparison
  const { data: directResult, error: directError } = await supabase
    .from("user_invitations")
    .select("*")
    .eq("invitation_token", token)
    .maybeSingle();
    
  if (directResult) {
    console.log("Found invitation with direct UUID comparison");
    return { invitation: directResult, error: null };
  }
  
  console.log("Direct UUID comparison failed, trying text comparison");
  
  // Try text-based comparison
  const { data: textResult, error: textError } = await supabase
    .from("user_invitations")
    .select("*")
    .filter("invitation_token::text", "eq", token)
    .maybeSingle();
    
  if (textResult) {
    console.log("Found invitation with text comparison");
    return { invitation: textResult, error: null };
  }
  
  console.log("Text comparison failed, trying custom SQL function");
  
  // Try our custom SQL function for flexible matching
  const { data: functionResult, error: functionError } = await supabase
    .rpc('find_invitation_by_token', { token_param: token });
    
  if (functionResult && Array.isArray(functionResult) && functionResult.length > 0) {
    console.log("Found invitation with custom SQL function");
    return { invitation: functionResult[0], error: null };
  }
  
  console.log("All token verification approaches failed");
  return { invitation: null, error: "Token not found" };
}
