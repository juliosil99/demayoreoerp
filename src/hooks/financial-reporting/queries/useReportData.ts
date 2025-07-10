
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { FinancialReportOptions, ReportData } from "@/types/financial-reporting";
import { processReportData } from "../utils/dataProcessor";

/**
 * Hook for fetching financial report data
 */
export function useReportData(
  reportType: 'income_statement' | 'balance_sheet' | 'cash_flow',
  options: FinancialReportOptions
) {
  const { user } = useAuth();
  const { periodType, periodId, year, period, compareWithPreviousYear = false, currency = 'MXN' } = options;

  return useQuery({
    queryKey: ['financial-report', reportType, user?.id, periodType, year, period, periodId, compareWithPreviousYear, currency],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        // Get period data
        const periodData = await fetchPeriodData(user.id, periodId, periodType, year, period);
        if (!periodData) throw new Error('Period not found');

        // Get account balances, expenses, sales, and payment adjustments for current period
        const balances = await fetchAccountBalances(user.id, periodData.id);
        const expenses = await fetchExpenses(user.id, periodData.start_date, periodData.end_date);
        const sales = await fetchSales(user.id, periodData.start_date, periodData.end_date);
        const paymentAdjustments = await fetchPaymentAdjustments(user.id, periodData.start_date, periodData.end_date);

        // Process current period data
        const currentPeriodData = processReportData(balances, expenses, currency, paymentAdjustments, sales);

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
          const prevPeriodData = await fetchPreviousPeriod(
            user.id, 
            periodData.period_type, 
            periodData.year - 1, 
            periodData.period
          );

          if (prevPeriodData) {
            const prevBalances = await fetchAccountBalances(user.id, prevPeriodData.id);
            const prevExpenses = await fetchExpenses(
              user.id, 
              prevPeriodData.start_date, 
              prevPeriodData.end_date
            );
            const prevSales = await fetchSales(
              user.id, 
              prevPeriodData.start_date, 
              prevPeriodData.end_date
            );
            const prevPaymentAdjustments = await fetchPaymentAdjustments(
              user.id, 
              prevPeriodData.start_date, 
              prevPeriodData.end_date
            );

            const previousPeriodData = processReportData(prevBalances, prevExpenses, currency, prevPaymentAdjustments, prevSales);

            result.previousPeriod = {
              startDate: prevPeriodData.start_date,
              endDate: prevPeriodData.end_date,
              data: previousPeriodData,
              currency: currency
            };
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
}

async function fetchPeriodData(userId: string, periodId?: string, periodType?: string, year?: number, period?: number) {
  if (periodId) {
    const { data, error } = await supabase
      .from('financial_periods')
      .select('*')
      .eq('id', periodId)
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } else if (year) {
    const { data, error } = await supabase
      .from('financial_periods')
      .select('*')
      .eq('user_id', userId)
      .eq('period_type', periodType)
      .eq('year', year)
      .eq('period', period || 1)
      .single();
      
    if (error) throw error;
    return data;
  }

  return null;
}

async function fetchPreviousPeriod(userId: string, periodType: string, previousYear: number, period: number) {
  const { data, error } = await supabase
    .from('financial_periods')
    .select('*')
    .eq('user_id', userId)
    .eq('period_type', periodType)
    .eq('year', previousYear)
    .eq('period', period)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function fetchAccountBalances(userId: string, periodId: string) {
  const { data, error } = await supabase
    .from('account_balances')
    .select(`
      balance,
      account_id,
      chart_of_accounts:account_id (name, account_type, code)
    `)
    .eq('period_id', periodId)
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

async function fetchExpenses(userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
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
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

async function fetchPaymentAdjustments(userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('payment_adjustments')
    .select(`
      id,
      adjustment_type,
      amount,
      description,
      payments:payment_id (date)
    `)
    .eq('user_id', userId)
    .gte('payments.date', startDate)
    .lte('payments.date', endDate);

  if (error) throw error;
  return data;
}

async function fetchSales(userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('Sales')
    .select(`
      id,
      price,
      cost,
      Quantity,
      Channel,
      productName,
      sku,
      comission,
      retention,
      shipping
    `)
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export default useReportData;
