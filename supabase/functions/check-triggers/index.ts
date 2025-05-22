
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    )
    
    console.log("Executing list_triggers_for_reconciliation RPC function...")
    
    try {
      // Execute the SQL to inspect triggers
      const { data, error } = await supabaseClient.rpc('list_triggers_for_reconciliation')
      
      if (error) {
        console.error("RPC function error:", error)
        throw error
      }
      
      console.log(`Found ${data?.length || 0} triggers`)
      
      const hasPaymentTrigger = data?.some((t) => 
        t.trigger_name?.toLowerCase().includes('payment') && 
        t.event_manipulation === 'UPDATE'
      ) || false
      
      const hasSalesTrigger = data?.some((t) => 
        t.trigger_name?.toLowerCase().includes('sale') && 
        t.event_manipulation === 'UPDATE'
      ) || false
      
      // Return the triggers data
      return new Response(JSON.stringify({ 
        success: true, 
        data,
        hasPaymentTrigger,
        hasSalesTrigger
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      })
    } catch (rpcError) {
      console.error("RPC call error:", rpcError)
      // Return a more graceful error for RPC failures
      return new Response(JSON.stringify({ 
        success: false, 
        error: String(rpcError),
        message: "Database function error: The SQL function exists but encountered an error"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 with error info in body instead of 500 to avoid fallback loops
      })
    }
  } catch (error) {
    console.error("Edge function error:", error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error),
      message: "Failed to check database triggers" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 with error info in body instead of 500
    })
  }
})
