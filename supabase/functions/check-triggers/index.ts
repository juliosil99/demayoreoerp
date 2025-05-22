
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    
    // Execute the SQL to inspect triggers
    const { data, error } = await supabaseClient.rpc('list_triggers_for_reconciliation')
    
    if (error) throw error
    
    // Return the triggers data
    return new Response(JSON.stringify({ 
      success: true, 
      data,
      hasPaymentTrigger: data.some((t: any) => 
        t.trigger_name?.toLowerCase().includes('payment') && 
        t.event_manipulation === 'UPDATE'
      ),
      hasSalesTrigger: data.some((t: any) => 
        t.trigger_name?.toLowerCase().includes('sale') && 
        t.event_manipulation === 'UPDATE'
      )
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
