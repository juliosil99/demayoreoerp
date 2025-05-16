import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { FinancialReportOptions, ReportData } from "@/types/financial-reporting";

export function useFinancialReports(
  reportType: 'income_statement' | 'balance_sheet' | 'cash_flow',
  options: FinancialReportOptions
) {
  const { user } = useAuth();
  const { periodType, periodId, year, period, compareWithPreviousYear = false, currency = 'MXN' } = options;

  // Fetch report data
  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['financial-report', reportType, user?.id, periodType, year, period, periodId, compareWithPreviousYear, currency],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        // If periodId is provided, use it directly
        let periodData;
        
        if (periodId) {
          // Get the financial period by ID
          const { data, error } = await supabase
            .from('financial_periods')
            .select('*')
            .eq('id', periodId)
            .eq('user_id', user.id)
            .single();
            
          if (error) throw error;
          periodData = data;
        } else if (year) {
          // Get the financial period by type, year, and period number
          const { data, error } = await supabase
            .from('financial_periods')
            .select('*')
            .eq('user_id', user.id)
            .eq('period_type', periodType)
            .eq('year', year)
            .eq('period', period || 1)
            .single();
            
          if (error) throw error;
          periodData = data;
        } else {
          throw new Error('Either periodId or year must be provided');
        }
        
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

        // Get expenses for this period - with currency support
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select(`
            id,
            amount,
            original_amount,
            currency,
            exchange_rate,
            chart_account_id,
            chart_of_accounts:chart_account_id (name, account_type, code)
          `)
          .gte('date', periodData.start_date)
          .lte('date', periodData.end_date)
          .eq('user_id', user.id);

        if (expensesError) throw expensesError;

        // Get statement configuration
        const { data: configData, error: configError } = await supabase
          .from('financial_statement_configs')
          .select('*')
          .eq('user_id', user.id)
          .eq('statement_type', reportType)
          .maybeSingle(); // Use maybeSingle to handle cases where no config exists yet

        // Transform balances into the report format
        const currentPeriodData: Record<string, number> = {};
        
        // Group accounts by their type and calculate totals
        if (balances) {
          balances.forEach(balance => {
            const accountType = balance.chart_of_accounts.account_type;
            
            if (!currentPeriodData[accountType]) {
              currentPeriodData[accountType] = 0;
            }
            
            currentPeriodData[accountType] += Number(balance.balance);
            
            // Also store the individual account
            const accountKey = `${balance.chart_of_accounts.code}-${balance.chart_of_accounts.name}`;
            currentPeriodData[accountKey] = Number(balance.balance);
          });
        }

        // Add expenses with proper currency handling
        if (expenses) {
          expenses.forEach(expense => {
            if (expense.chart_of_accounts) {
              const accountType = expense.chart_of_accounts.account_type;
              const accountKey = `${expense.chart_of_accounts.code}-${expense.chart_of_accounts.name}`;
              
              // Calculate the amount in the requested currency
              let amountInReportCurrency = 0;
              
              if (expense.currency === currency) {
                // If expense is already in the requested currency, use original amount
                amountInReportCurrency = Number(expense.original_amount);
              } else {
                // Otherwise convert using the stored exchange rate
                amountInReportCurrency = Number(expense.amount); // This is already stored in MXN
                
                // If report currency is USD but the amount is in MXN, convert back
                if (currency === 'USD' && expense.currency === 'MXN') {
                  // Use the inverse of the exchange rate if we're converting from MXN to USD
                  amountInReportCurrency = Number(expense.amount) / Number(expense.exchange_rate || 1);
                }
              }
              
              // Add to account type total
              if (!currentPeriodData[accountType]) {
                currentPeriodData[accountType] = 0;
              }
              currentPeriodData[accountType] += amountInReportCurrency;
              
              // Add to individual account
              if (!currentPeriodData[accountKey]) {
                currentPeriodData[accountKey] = 0;
              }
              currentPeriodData[accountKey] += amountInReportCurrency;
            }
          });
        }

        const result: ReportData = {
          currentPeriod: {
            startDate: periodData.start_date,
            endDate: periodData.end_date,
            data: currentPeriodData,
            currency: currency
          }
        };

        // Get comparison data from previous year if requested
        if (compareWithPreviousYear) {
          const previousYear = periodData.year - 1;
          
          // Get the matching period from previous year
          const { data: prevPeriodData, error: prevPeriodError } = await supabase
            .from('financial_periods')
            .select('*')
            .eq('user_id', user.id)
            .eq('period_type', periodData.period_type)
            .eq('year', previousYear)
            .eq('period', periodData.period)
            .maybeSingle(); // Use maybeSingle to handle cases where previous period doesn't exist

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

            // Get expenses for previous period with currency support
            const { data: prevExpenses, error: prevExpensesError } = await supabase
              .from('expenses')
              .select(`
                id,
                amount,
                original_amount,
                currency,
                exchange_rate,
                chart_account_id,
                chart_of_accounts:chart_account_id (name, account_type, code)
              `)
              .gte('date', prevPeriodData.start_date)
              .lte('date', prevPeriodData.end_date)
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

              // Add expenses for previous period with currency handling
              if (!prevExpensesError && prevExpenses) {
                prevExpenses.forEach(expense => {
                  if (expense.chart_of_accounts) {
                    const accountType = expense.chart_of_accounts.account_type;
                    const accountKey = `${expense.chart_of_accounts.code}-${expense.chart_of_accounts.name}`;
                    
                    // Calculate the amount in the requested currency
                    let amountInReportCurrency = 0;
                    
                    if (expense.currency === currency) {
                      amountInReportCurrency = Number(expense.original_amount);
                    } else {
                      amountInReportCurrency = Number(expense.amount); // This is already in MXN
                      
                      // If report currency is USD but the amount is in MXN, convert back
                      if (currency === 'USD' && expense.currency === 'MXN') {
                        amountInReportCurrency = Number(expense.amount) / Number(expense.exchange_rate || 1);
                      }
                    }
                    
                    // Add to account type total
                    if (!previousPeriodData[accountType]) {
                      previousPeriodData[accountType] = 0;
                    }
                    previousPeriodData[accountType] += amountInReportCurrency;
                    
                    // Add to individual account
                    if (!previousPeriodData[accountKey]) {
                      previousPeriodData[accountKey] = 0;
                    }
                    previousPeriodData[accountKey] += amountInReportCurrency;
                  }
                });
              }

              result.previousPeriod = {
                startDate: prevPeriodData.start_date,
                endDate: prevPeriodData.end_date,
                data: previousPeriodData,
                currency: currency
              };
            }
          }
        }

        return result;
      } catch (error) {
        console.error('Error loading financial report:', error);
        throw error;
      }
    },
    enabled: !!user?.id && (!!periodId || (!!periodType && !!year))
  });

  return {
    reportData,
    isLoading,
    error
  };
}
