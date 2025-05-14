
import { createSupabaseClient } from "./supabaseClient.ts";

// Authenticate the user from the request headers
export async function authenticateUser(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseClient = createSupabaseClient();
  
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
  
  if (userError || !user) {
    throw new Error("Authentication failed");
  }
  
  return { user, token };
}
