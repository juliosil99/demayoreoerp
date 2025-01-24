import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

const supabaseUrl = "https://dulmmxtkgqkcfovvfxzu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bG1teHRrZ3FrY2ZvdnZmeHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMzgzMzQsImV4cCI6MjA1MjYxNDMzNH0.n_8ZA-Z0dUpNXBfZUR4kUQEIP_Kh0rf1x32E8QIAU-8";

if (!supabaseUrl || !supabaseAnonKey) {
  toast.error("Failed to load API Keys. Please check your Supabase configuration.");
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);