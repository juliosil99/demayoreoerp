
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { FinancialReportOptions, ReportData } from "@/types/financial-reporting";
import { format, subYears, parseISO } from "date-fns";

export function useFinancialReports(
  reportType: 'income_statement' | 'balance_sheet' | 'cash_flow',
  options: FinancialReportOptions
) {
  const { user } = useAuth();
  const { periodType, year, period, compareWithPreviousYear = false } = options;

  // Fetch report data
  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['financial-report', reportType, user?.id, periodType, year, period],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get the financial period
      const { data: periodData, error: periodError } = await supabase
        .from('financial_periods')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_type', periodType)
        .eq('year', year)
        .eq('period', period || 1)
        .single();

      if (periodError) throw periodError;
      if (!periodData) throw new Error('Period not found');

      // Get account balances for this period
      const { data: balances, error: balancesError } = await supabase
        .from('account_balances')
        .select(`
          balance,
          account_id,
          chart_of_accounts:account_id (name, account_type, code)
        `)
        .eq('period_id', periodData.id)
        .eq('user_id', user.id);

      if (balancesError) throw balancesError;

      // Get statement configuration
      const { data: configData, error: configError } = await supabase
        .from('financial_statement_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('statement_type', reportType)
        .single();

      if (configError) throw configError;

      // Transform balances into the report format
      const currentPeriodData: Record<string, number> = {};
      
      // Group accounts by their type and calculate totals
      balances?.forEach(balance => {
        const accountType = balance.chart_of_accounts.account_type;
        
        if (!currentPeriodData[accountType]) {
          currentPeriodData[accountType] = 0;
        }
        
        currentPeriodData[accountType] += Number(balance.balance);
        
        // Also store the individual account
        const accountKey = `${balance.chart_of_accounts.code}-${balance.chart_of_accounts.name}`;
        currentPeriodData[accountKey] = Number(balance.balance);
      });

      const result: ReportData = {
        currentPeriod: {
          startDate: periodData.start_date,
          endDate: periodData.end_date,
          data: currentPeriodData
        }
      };

      // Get comparison data from previous year if requested
      if (compareWithPreviousYear) {
        const previousYear = year - 1;
        
        // Get the matching period from previous year
        const { data: prevPeriodData, error: prevPeriodError } = await supabase
          .from('financial_periods')
          .select('*')
          .eq('user_id', user.id)
          .eq('period_type', periodType)
          .eq('year', previousYear)
          .eq('period', period || 1)
          .single();

        if (!prevPeriodError && prevPeriodData) {
          // Get account balances for previous period
          const { data: prevBalances, error: prevBalancesError } = await supabase
            .from('account_balances')
            .select(`
              balance,
              account_id,
              chart_of_accounts:account_id (name, account_type, code)
            `)
            .eq('period_id', prevPeriodData.id)
            .eq('user_id', user.id);

          if (!prevBalancesError && prevBalances) {
            // Transform previous period data
            const previousPeriodData: Record<string, number> = {};
            
            prevBalances.forEach(balance => {
              const accountType = balance.chart_of_accounts.account_type;
              
              if (!previousPeriodData[accountType]) {
                previousPeriodData[accountType] = 0;
              }
              
              previousPeriodData[accountType] += Number(balance.balance);
              
              const accountKey = `${balance.chart_of_accounts.code}-${balance.chart_of_accounts.name}`;
              previousPeriodData[accountKey] = Number(balance.balance);
            });

            result.previousPeriod = {
              startDate: prevPeriodData.start_date,
              endDate: prevPeriodData.end_date,
              data: previousPeriodData
            };
          }
        }
      }

      return result;
    },
    enabled: !!user?.id && !!periodType && !!year
  });

  return {
    reportData,
    isLoading,
    error
  };
}
