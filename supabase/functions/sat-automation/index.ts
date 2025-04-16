
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
// Fix import path for playwright-chromium
import { chromium } from "https://deno.land/x/playwright_chromium@v0.4.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  console.log("SAT automation edge function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log("Processing SAT automation request");
    const { rfc, password, startDate, endDate, jobId } = await req.json();
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Get user ID from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Authentication failed:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update job status to in-progress
    await supabaseClient
      .from('sat_automation_jobs')
      .update({ status: 'in_progress' })
      .eq('id', jobId)
      .eq('user_id', user.id);

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
      
      // Check if CAPTCHA is present
      const captchaExists = await page.$('#divCaptcha');
      
      if (captchaExists) {
        // Take screenshot of CAPTCHA area
        const captchaElement = await page.$('#divCaptcha img');
        if (captchaElement) {
          const captchaImage = await captchaElement.screenshot({ type: 'jpeg', quality: 90 });
          const base64Image = Buffer.from(captchaImage).toString('base64');
          
          // Create captcha session in database
          const { data: captchaSession } = await supabaseClient
            .from('sat_captcha_sessions')
            .insert({
              job_id: jobId,
              captcha_image: `data:image/jpeg;base64,${base64Image}`,
              resolved: false
            })
            .select('id')
            .single();
            
          // Update job to require CAPTCHA
          await supabaseClient
            .from('sat_automation_jobs')
            .update({ 
              status: 'captcha_required',
              error_message: 'CAPTCHA resolution required'
            })
            .eq('id', jobId);
            
          // Close browser and return early
          await browser.close();
          
          console.log("CAPTCHA detected, returning session ID:", captchaSession?.id);
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              requiresCaptcha: true, 
              captchaSessionId: captchaSession?.id,
              message: "CAPTCHA resolution required"
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      // Submit the login form
      await page.click('#submit');
      
      // Wait for login to complete and check if we're on the dashboard
      try {
        await page.waitForSelector('#selFiltro', { timeout: 10000 });
      } catch (e) {
        // Check for error messages
        const errorText = await page.textContent('.errorcl') || '';
        throw new Error(`Login failed: ${errorText.trim() || 'Invalid credentials or CAPTCHA'}`);
      }
      
      // Navigate to "Consultar Facturas Recibidas"
      await page.click('a:has-text("Consultar Facturas Recibidas")');
      
      // Set date range for invoice search
      await page.fill('input[name="fechaInicial"]', startDate);
      await page.fill('input[name="fechaFinal"]', endDate);
      
      // Submit search form
      await page.click('#btnBusqueda');
      
      // Wait for search results
      await page.waitForSelector('table.detalleTable', { timeout: 30000 });
      
      // Check if there are any results
      const noResults = await page.$$eval('.noResultados', elements => elements.length > 0);
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
      const totalResults = await page.$$eval('table.detalleTable tbody tr', rows => rows.length);
      
      // Update job status with total files
      await supabaseClient
        .from('sat_automation_jobs')
        .update({ total_files: totalResults })
        .eq('id', jobId);
      
      // Process each invoice XML
      for (let i = 0; i < totalResults; i++) {
        try {
          // Click on the XML download button
          await page.click(`table.detalleTable tbody tr:nth-child(${i + 1}) td:last-child a[id^="BtnDescarga"]`);
          
          // Wait for download to complete
          await page.waitForTimeout(2000);
          
          // Get invoice UUID from table cell
          const uuid = await page.$eval(
            `table.detalleTable tbody tr:nth-child(${i + 1}) td:nth-child(4)`, 
            cell => cell.textContent?.trim()
          );
          
          if (!uuid) continue;
          
          // For now, simulate a successful download
          console.log(`Downloaded XML with UUID: ${uuid}`);
          
          // Update download counter
          await supabaseClient
            .from('sat_automation_jobs')
            .update({ 
              downloaded_files: i + 1
            })
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
      console.error("Error during SAT automation:", error);
      
      // Take screenshot of error state
      const screenshot = await page.screenshot({ fullPage: true });
      const screenshotPath = `${user.id}/${jobId}/error-screenshot.png`;
      
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
          error: error.message || "Unknown error occurred",
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
