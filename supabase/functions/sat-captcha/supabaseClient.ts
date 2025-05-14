
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

// Create and export Supabase client for reuse
export const createSupabaseClient = (authToken?: string) => {
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    authToken || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
  );
};
