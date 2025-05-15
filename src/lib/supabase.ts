
// Re-export the typed Supabase client
export { supabase } from "@/integrations/supabase/client";

// Helper function to initialize financial periods for a new user
export const initializeFinancialPeriods = async (userId: string) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // Create monthly periods
  const { error: monthlyError } = await supabase.rpc('create_monthly_periods_for_year', {
    user_uuid: userId,
    year_param: currentYear
  });
  
  // Create quarterly periods
  const { error: quarterlyError } = await supabase.rpc('create_quarterly_periods_for_year', {
    user_uuid: userId,
    year_param: currentYear
  });
  
  // Create annual period
  const { error: annualError } = await supabase.rpc('create_annual_period', {
    user_uuid: userId,
    year_param: currentYear
  });
  
  // Create daily periods for current month
  const { error: dailyError } = await supabase.rpc('create_daily_periods_for_month', {
    user_uuid: userId,
    year_param: currentYear,
    month_param: currentMonth
  });
  
  return {
    success: !monthlyError && !quarterlyError && !annualError && !dailyError,
    errors: {
      monthlyError,
      quarterlyError,
      annualError,
      dailyError
    }
  };
};
