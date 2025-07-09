
import { supabase } from "@/lib/supabase";

/**
 * Checks if a RFC already exists for a specific user
 * @param rfc The RFC to check
 * @param userId The user ID to check against
 * @returns true if the RFC exists for this user, false otherwise
 */
export async function checkRFCExists(rfc: string, userId: string): Promise<boolean> {
  console.log("🔍 Checking if RFC exists for user:", rfc, userId);
  
  const { data, error } = await supabase
    .from("companies")
    .select("rfc")
    .eq("rfc", rfc)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("❌ Error checking RFC:", error);
    return false;
  }

  console.log("✅ RFC check result:", data);
  return data !== null;
}
