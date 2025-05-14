
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
// Use Puppeteer instead of Playwright for better Deno compatibility
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
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

    // Get the CAPTCHA session
    const { data: captchaSession, error: sessionError } = await supabaseClient
      .from('sat_captcha_sessions')
      .select('*')
      .eq('id', captchaSessionId)
      .single();
      
    if (sessionError || !captchaSession) {
      return new Response(
        JSON.stringify({ success: false, error: "CAPTCHA session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the job details
    const { data: job, error: jobError } = await supabaseClient
      .from('sat_automation_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();
      
    if (jobError || !job) {
      return new Response(
        JSON.stringify({ success: false, error: "Job not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Update job status to resuming
    await supabaseClient
      .from('sat_automation_jobs')
      .update({ status: 'resuming' })
      .eq('id', jobId);
      
    // Update captcha session to resolved
    await supabaseClient
      .from('sat_captcha_sessions')
      .update({ resolved: true, solution: captchaSolution })
      .eq('id', captchaSessionId);
    
    // Launch browser and continue the process
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      // Navigate to SAT login page
      await page.goto('https://portalcfdi.facturaelectronica.sat.gob.mx');
      
      // Fill RFC and password fields
      await page.type('#rfc', rfc);
      await page.type('#password', password);
      
      // Fill CAPTCHA solution if needed
      const captchaInput = await page.$('#captcha');
      if (captchaInput) {
        await captchaInput.type(captchaSolution);
      } else {
        throw new Error("CAPTCHA field not found");
      }
      
      // Submit the login form
      await page.click('#submit');
      
      // Wait for login to complete and check if we're on the dashboard
      try {
        await page.waitForSelector('#selFiltro', { timeout: 10000 });
      } catch (e) {
        // Check for error messages
        const errorText = await page.evaluate(() => {
          const errorEl = document.querySelector('.errorcl');
          return errorEl ? errorEl.textContent : '';
        });
        throw new Error(`Login failed: ${errorText.trim() || 'Invalid CAPTCHA solution or credentials'}`);
      }
      
      // Continue with the process similar to the main function...
      // Navigate to "Consultar Facturas Recibidas"
      await page.click('a:has-text("Consultar Facturas Recibidas")');
      
      // Set date range for invoice search
      await page.type('input[name="fechaInicial"]', job.start_date);
      await page.type('input[name="fechaFinal"]', job.end_date);
      
      // Submit search form
      await page.click('#btnBusqueda');
      
      // Wait for search results
      await page.waitForSelector('table.detalleTable', { timeout: 30000 });
      
      // Check if there are any results
      const noResults = await page.evaluate(() => {
        return document.querySelectorAll('.noResultados').length > 0;
      });
      
      if (noResults) {
        await browser.close();
        
        // Update job status
        await supabaseClient
          .from('sat_automation_jobs')
          .update({ 
            status: 'completed',
            error_message: 'No invoices found for the specified date range'
          })
          .eq('id', jobId);
          
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "No invoices found for the specified date range" 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get total number of results
      const totalResults = await page.evaluate(() => {
        return document.querySelectorAll('table.detalleTable tbody tr').length;
      });
      
      // Update job status with total files
      await supabaseClient
        .from('sat_automation_jobs')
        .update({ total_files: totalResults })
        .eq('id', jobId);
      
      // Process each invoice XML - similar to main function
      for (let i = 0; i < totalResults; i++) {
        try {
          // Click download button for each invoice
          await page.click(`table.detalleTable tbody tr:nth-child(${i + 1}) td:last-child a[id^="BtnDescarga"]`);
          await page.waitForTimeout(2000);
          
          // Update download counter
          await supabaseClient
            .from('sat_automation_jobs')
            .update({ downloaded_files: i + 1 })
            .eq('id', jobId);
        } catch (downloadError) {
          console.error(`Error downloading invoice ${i + 1}:`, downloadError);
        }
      }
      
      // Complete the job
      await supabaseClient
        .from('sat_automation_jobs')
        .update({ 
          status: 'completed',
          error_message: null
        })
        .eq('id', jobId);
        
      // Close browser
      await browser.close();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully downloaded ${totalResults} invoices` 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (error) {
      console.error("Error during SAT captcha resolution:", error);
      
      // Take screenshot of error state
      const screenshot = await page.screenshot();
      const screenshotPath = `${user.id}/${jobId}/captcha-error-screenshot.png`;
      
      // Upload screenshot to storage
      await supabaseClient.storage
        .from('sat_automation')
        .upload(screenshotPath, screenshot);
        
      // Update job with error
      await supabaseClient
        .from('sat_automation_jobs')
        .update({ 
          status: 'failed',
          error_message: error.message || "Unknown error occurred"
        })
        .eq('id', jobId);
        
      // Close browser
      await browser.close();
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message || "Unknown error occurred during CAPTCHA resolution",
          screenshotPath
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
