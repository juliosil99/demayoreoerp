
import { format } from "https://esm.sh/date-fns@4.1.0";
import { addDays, parseISO, differenceInDays } from "https://esm.sh/date-fns@4.1.0";
import { getScheduledPayments, analyzeExpensePatterns } from "./dataUtils.ts";

export function generateForecastWeeks(
  forecastId: string,
  startDate: Date,
  numWeeks: number,
  aiPredictions: any[],
  historicalData: any,
  config: any,
  initialAvailableCashBalance: number = 0
) {
  console.log("[DEBUG - Edge Function - Balance Tracking] generateForecastWeeks called with:", {
    forecastId,
    startDate: startDate.toISOString(),
    numWeeks,
    aiPredictionsCount: aiPredictions?.length || 0,
    config,
    initialAvailableCashBalance,
    balanceHistoryEntries: historicalData?.balance_history?.length || 0
  });
  
  const weeks = [];
  let runningBalance = config?.startWithCurrentBalance ? initialAvailableCashBalance : 0;
  
  // Analyze historical expense patterns
  const expensePatterns = analyzeExpensePatterns(historicalData.expenses || []);
  
  // Process each week
  for (let i = 0; i < numWeeks; i++) {
    const weekNumber = i + 1;
    const weekStart = addDays(startDate, i * 7);
    const weekEnd = addDays(weekStart, 6);
    
    // Get scheduled payments for this week
    const scheduledPayments = getScheduledPayments(
      historicalData.payables,
      historicalData.upcomingCreditPayments,
      weekStart,
      weekEnd
    );
    
    // Calculate scheduled outflows
    const scheduledOutflows = scheduledPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Start with AI predictions if available
    const aiPrediction = aiPredictions.find(p => p.weekNumber === weekNumber);
    let predictedInflows = aiPrediction?.predictedInflows;
    let predictedOutflows = aiPrediction?.predictedOutflows;
    let confidenceScore = aiPrediction?.confidenceScore;
    
    if (!aiPrediction) {
      // Calculate predicted outflows using scheduled payments and patterns
      predictedOutflows = scheduledOutflows;
      
      // Add predicted regular expenses based on patterns
      Object.entries(expensePatterns).forEach(([category, pattern]: [string, any]) => {
        if (pattern.isRecurring || pattern.confidence > 0.7) {
          predictedOutflows += pattern.weeklyAverage;
        }
      });
      
      // Calculate inflows using historical data and trends
      const baseInflow = historicalData.receivables?.reduce((sum: number, rec: any) => {
        const dueDate = new Date(rec.due_date);
        return dueDate >= weekStart && dueDate <= weekEnd ? sum + rec.amount : sum;
      }, 0) || 0;
      
      predictedInflows = baseInflow;
      
      // Add historical sales average with trend analysis
      const salesTrend = calculateSalesTrend(historicalData.sales || []);
      predictedInflows += salesTrend.weeklyAverage * (1 + (salesTrend.growthRate * i));
      
      // Calculate confidence score based on data quality
      confidenceScore = Math.min(
        1,
        (scheduledOutflows / predictedOutflows) * 0.7 + // Higher confidence for scheduled payments
        (baseInflow / predictedInflows) * 0.3 // Lower weight for predicted inflows
      );
    }
    
    // Calculate balances
    const netCashFlow = predictedInflows - predictedOutflows;
    const startingBalance = runningBalance;
    runningBalance += netCashFlow;
    
    // For rolling forecasts, determine balance confidence
    const balanceConfidence = determineBalanceConfidence(i, config, historicalData);
    
    weeks.push({
      forecast_id: forecastId,
      week_number: weekNumber,
      week_start_date: format(weekStart, 'yyyy-MM-dd'),
      week_end_date: format(weekEnd, 'yyyy-MM-dd'),
      predicted_inflows: predictedInflows,
      predicted_outflows: predictedOutflows,
      confidence_score: confidenceScore,
      starting_balance: startingBalance,
      ending_balance: runningBalance,
      balance_confidence: balanceConfidence,
      is_reconciled: config?.useRollingForecast && i === 0 && config?.reconcileBalances
    });
  }
  
  return weeks;
}

function calculateSalesTrend(sales: any[]) {
  if (!sales?.length) {
    return { weeklyAverage: 0, growthRate: 0 };
  }
  
  // Sort sales by date
  const sortedSales = [...sales].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Calculate weekly averages for the first and second half of the period
  const midPoint = Math.floor(sortedSales.length / 2);
  const firstHalf = sortedSales.slice(0, midPoint);
  const secondHalf = sortedSales.slice(midPoint);
  
  const firstHalfAvg = firstHalf.reduce((sum, sale) => sum + (sale.amount || 0), 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, sale) => sum + (sale.amount || 0), 0) / secondHalf.length;
  
  const weeklyAverage = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0) / sales.length;
  const growthRate = firstHalfAvg > 0 ? (secondHalfAvg - firstHalfAvg) / firstHalfAvg : 0;
  
  return { weeklyAverage, growthRate };
}

function determineBalanceConfidence(
  weekIndex: number,
  config: any,
  historicalData: any
): 'high' | 'medium' | 'low' {
  if (config?.useRollingForecast && historicalData?.balance_history?.length > 0) {
    if (weekIndex === 0) return 'high';
    if (weekIndex < 4) return 'medium';
    return 'low';
  }
  
  if (weekIndex < 4) return 'high';
  if (weekIndex < 8) return 'medium';
  return 'low';
}
