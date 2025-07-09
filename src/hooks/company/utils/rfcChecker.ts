
import { supabase } from "@/lib/supabase";

/**
 * Checks if a RFC already exists for a specific user
 * @param rfc The RFC to check
 * @param userId The user ID to check against
 * @returns true if the RFC exists for this user, false otherwise
 */
export async function checkRFCExists(rfc: string, userId: string): Promise<boolean> {
  console.log("🔍 DEBUG: Checking if RFC exists");
  console.log("📋 RFC:", rfc);
  console.log("👤 User ID:", userId);
  
  const { data, error } = await supabase
    .from("companies")
    .select("rfc, user_id, id, nombre")
    .eq("rfc", rfc)
    .eq("user_id", userId)
    .maybeSingle();

  console.log("💾 Supabase query result:");
  console.log("✅ Data:", data);
  console.log("❌ Error:", error);

  if (error) {
    console.error("❌ Error checking RFC:", error);
    return false;
  }

  const exists = data !== null;
  console.log("🎯 RFC exists for this user:", exists);
  return exists;
}
