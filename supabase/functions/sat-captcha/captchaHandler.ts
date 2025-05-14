
import { corsHeaders } from "./cors.ts";
import { authenticateUser } from "./auth.ts";
import { 
  getCaptchaSession, 
  getJob, 
  updateJobStatus, 
  updateCaptchaSession,
  updateJobTotalFiles,
  updateJobCompletion,
  uploadErrorScreenshot
} from "./database.ts";
import { processSatPortal } from "./browser.ts";

// Main handler for captcha resolution requests
export async function handleCaptchaResolution(req: Request, payload: any) {
  const { captchaSessionId, captchaSolution, rfc, password, jobId } = payload;

  try {
    // Authenticate user
    const { user, token } = await authenticateUser(req);
    
    // Get the CAPTCHA session
    const captchaSession = await getCaptchaSession(captchaSessionId, token);
    
    // Get the job details
    const job = await getJob(jobId, user.id, token);
    
    // Update job status to resuming
    await updateJobStatus(jobId, 'resuming', token);
    
    // Update captcha session to resolved
    await updateCaptchaSession(captchaSessionId, captchaSolution, token);
    
    try {
      // Process SAT portal
      const result = await processSatPortal(rfc, password, captchaSolution, job, token);
      
      // Handle no results case
      if (result.noResults) {
        await updateJobCompletion(jobId, 'completed', 'No invoices found for the specified date range', token);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "No invoices found for the specified date range" 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Update job with total files
      if (result.totalResults) {
        await updateJobTotalFiles(jobId, result.totalResults, token);
      }
      
      // Complete the job
      await updateJobCompletion(jobId, 'completed', null, token);
      
      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (error) {
      console.error("Error during SAT captcha resolution:", error);
      
      // Upload screenshot if available
      let screenshotPath;
      if (error.screenshot) {
        screenshotPath = await uploadErrorScreenshot(user.id, jobId, error.screenshot, token);
      }
      
      // Update job with error
      await updateJobCompletion(jobId, 'failed', error.message || "Unknown error occurred", token);
      
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
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Authentication or validation error" 
      }),
      { status: error.message.includes("auth") ? 401 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
