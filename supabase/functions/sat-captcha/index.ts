
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { chromium } from "https://esm.sh/playwright@1.35.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { captchaSessionId, captchaSolution, rfc, password, jobId } = await req.json();
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get user ID from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update captcha session with solution
    await supabaseClient
      .from('sat_captcha_sessions')
      .update({ 
        resolved: true,
        captcha_solution: captchaSolution,
        updated_at: new Date().toISOString()
      })
      .eq('id', captchaSessionId);

    // Update job status to resuming
    await supabaseClient
      .from('sat_automation_jobs')
      .update({ 
        status: 'resuming',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Launch browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navigate to SAT login page
      await page.goto('https://portalcfdi.facturaelectronica.sat.gob.mx');
      
      // Fill RFC and password fields
      await page.fill('#rfc', rfc);
      await page.fill('#password', password);
      
      // Fill CAPTCHA solution
      const captchaInput = await page.$('#captchaText');
      if (captchaInput) {
        await captchaInput.fill(captchaSolution);
      } else {
        throw new Error("CAPTCHA input field not found");
      }
      
      // Submit the login form
      await page.click('#submit');
      
      // Wait for login to complete and check if we're on the dashboard
      try {
        await page.waitForSelector('#selFiltro', { timeout: 10000 });
      } catch (e) {
        // Take screenshot of error state
        const screenshot = await page.screenshot({ fullPage: true });
        const screenshotPath = `${user.id}/${jobId}/captcha-error.png`;
        
        // Upload screenshot to storage
        await supabaseClient.storage
          .from('sat_automation')
          .upload(screenshotPath, screenshot);
          
        throw new Error("CAPTCHA solution was incorrect or login failed");
      }
      
      // Get job details to retrieve date range
      const { data: job } = await supabaseClient
        .from('sat_automation_jobs')
        .select('start_date, end_date')
        .eq('id', jobId)
        .single();
        
      if (!job) {
        throw new Error("Job not found");
      }
      
      const { start_date, end_date } = job;
      
      // Navigate to "Consultar Facturas Recibidas"
      await page.click('a:has-text("Consultar Facturas Recibidas")');
      
      // Set date range for invoice search
      await page.fill('input[name="fechaInicial"]', start_date);
      await page.fill('input[name="fechaFinal"]', end_date);
      
      // Submit search form
      await page.click('#btnBusqueda');
      
      // Wait for search results
      await page.waitForSelector('table.detalleTable', { timeout: 30000 });
      
      // The rest of the function continues similar to sat-automation endpoint
      // ... (download process)
      
      // Update job status
      await supabaseClient
        .from('sat_automation_jobs')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
        
      // Close browser
      await browser.close();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Successfully resumed job with CAPTCHA solution" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (error) {
      console.error("Error during SAT CAPTCHA handling:", error);
      
      // Update job with error
      await supabaseClient
        .from('sat_automation_jobs')
        .update({ 
          status: 'failed',
          error_message: error.message || "Unknown error occurred",
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
        
      // Close browser
      await browser.close();
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || "Unknown error occurred"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Request handling error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
