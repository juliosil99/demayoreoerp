
import { createSupabaseClient } from "./supabaseClient.ts";

// Database operations for captcha sessions and automation jobs
export async function getCaptchaSession(sessionId: string, token: string) {
  const supabaseClient = createSupabaseClient(token);
  
  const { data: captchaSession, error: sessionError } = await supabaseClient
    .from('sat_captcha_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
    
  if (sessionError || !captchaSession) {
    throw new Error("CAPTCHA session not found");
  }
  
  return captchaSession;
}

export async function getJob(jobId: string, userId: string, token: string) {
  const supabaseClient = createSupabaseClient(token);
  
  const { data: job, error: jobError } = await supabaseClient
    .from('sat_automation_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', userId)
    .single();
    
  if (jobError || !job) {
    throw new Error("Job not found");
  }
  
  return job;
}

export async function updateJobStatus(jobId: string, status: string, token: string) {
  const supabaseClient = createSupabaseClient(token);
  
  await supabaseClient
    .from('sat_automation_jobs')
    .update({ status })
    .eq('id', jobId);
}

export async function updateCaptchaSession(sessionId: string, solution: string, token: string) {
  const supabaseClient = createSupabaseClient(token);
  
  await supabaseClient
    .from('sat_captcha_sessions')
    .update({ resolved: true, solution })
    .eq('id', sessionId);
}

export async function updateJobTotalFiles(jobId: string, totalFiles: number, token: string) {
  const supabaseClient = createSupabaseClient(token);
  
  await supabaseClient
    .from('sat_automation_jobs')
    .update({ total_files: totalFiles })
    .eq('id', jobId);
}

export async function updateDownloadedFiles(jobId: string, count: number, token: string) {
  const supabaseClient = createSupabaseClient(token);
  
  await supabaseClient
    .from('sat_automation_jobs')
    .update({ downloaded_files: count })
    .eq('id', jobId);
}

export async function updateJobCompletion(jobId: string, status: string, errorMessage: string | null, token: string) {
  const supabaseClient = createSupabaseClient(token);
  
  await supabaseClient
    .from('sat_automation_jobs')
    .update({ 
      status,
      error_message: errorMessage
    })
    .eq('id', jobId);
}

export async function uploadErrorScreenshot(userId: string, jobId: string, screenshot: Uint8Array, token: string) {
  const supabaseClient = createSupabaseClient(token);
  const screenshotPath = `${userId}/${jobId}/captcha-error-screenshot.png`;
  
  await supabaseClient.storage
    .from('sat_automation')
    .upload(screenshotPath, screenshot);
    
  return screenshotPath;
}
