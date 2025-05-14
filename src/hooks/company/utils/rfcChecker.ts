
import { supabase } from "@/lib/supabase";

/**
 * Checks if a RFC already exists in the database
 * @param rfc The RFC to check
 * @returns true if the RFC exists, false otherwise
 */
export async function checkRFCExists(rfc: string): Promise<boolean> {
  console.log("🔍 Checking if RFC exists:", rfc);
  
  const { data, error } = await supabase
    .from("companies")
    .select("rfc")
    .eq("rfc", rfc)
    .maybeSingle();

  if (error) {
    console.error("❌ Error checking RFC:", error);
    return false;
  }

  console.log("✅ RFC check result:", data);
  return data !== null;
}
