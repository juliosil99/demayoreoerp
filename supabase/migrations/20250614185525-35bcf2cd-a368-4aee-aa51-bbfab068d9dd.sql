
-- Add DELETE policy to sat_automation_jobs table to allow users to delete their own jobs
CREATE POLICY "Users can delete their own SAT automation jobs" 
  ON public.sat_automation_jobs 
  FOR DELETE 
  USING (auth.uid() = user_id);
