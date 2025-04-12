
import { format } from "https://esm.sh/date-fns@4.1.0";
import { addDays, parseISO, differenceInDays } from "https://esm.sh/date-fns@4.1.0";
import { calculateAverageAmount } from "./dataUtils.ts";

/**
 * Helper function to generate forecast weeks with bank balance tracking
 */
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
    balanceHistoryCount: historicalData?.balance_history?.length || 0
  });
  
  console.log("[DEBUG - Edge Function - Balance Tracking] Historical data balances:", {
    availableCashBalance: historicalData?.availableCashBalance,
    creditLiabilities: historicalData?.creditLiabilities,
    netPosition: historicalData?.netPosition
  });
  
  const weeks = [];
  
  // Calculate base values from historical data
  const historicalPayables = calculateAverageAmount(historicalData.payables);
  const historicalReceivables = calculateAverageAmount(historicalData.receivables);
  const historicalExpenses = calculateAverageAmount(historicalData.expenses);
  const historicalSales = calculateAverageAmount(historicalData.sales);
  
  // Base weekly values
  const baseInflow = historicalReceivables + historicalSales > 0 
    ? historicalReceivables + historicalSales 
    : 10000; // Fallback if no historical data
    
  const baseOutflow = historicalPayables + historicalExpenses > 0
    ? historicalPayables + historicalExpenses
    : 8000;  // Fallback if no historical data
  
  // Track running balance
  let runningBalance = config?.startWithCurrentBalance ? initialAvailableCashBalance : 0;
  
  console.log("[DEBUG - Edge Function - Balance Tracking] Initial running balance calculation:", {
    startWithCurrentBalance: config?.startWithCurrentBalance,
    initialAvailableCashBalance,
    runningBalance
  });
  
  // Process upcoming credit payments if available
  const upcomingCreditPayments = historicalData.upcomingCreditPayments || [];
  
  // Create a map of credit payments by week
  const creditPaymentsByWeek = new Map();
  
  if (upcomingCreditPayments.length > 0 && config?.includeCreditPayments) {
    upcomingCreditPayments.forEach(payment => {
      const paymentDate = new Date(payment.dueDate);
      // Find the week this payment should be included in
      for (let i = 0; i < numWeeks; i++) {
        const weekStart = addDays(startDate, i * 7);
        const weekEnd = addDays(weekStart, 6);
        
        if (paymentDate >= weekStart && paymentDate <= weekEnd) {
          const weekNumber = i + 1;
          if (!creditPaymentsByWeek.has(weekNumber)) {
            creditPaymentsByWeek.set(weekNumber, 0);
          }
          creditPaymentsByWeek.set(
            weekNumber, 
            creditPaymentsByWeek.get(weekNumber) + payment.amount
          );
          break;
        }
      }
    });
  }

  // For rolling forecasts, determine balance confidence based on data age
  const determineBalanceConfidence = (weekIndex: number) => {
    // For rolling forecasts with history data
    if (config?.useRollingForecast && historicalData?.balance_history?.length > 0) {
      // First week is based on current confirmed data
      if (weekIndex === 0) return 'high';
      // Next few weeks are medium confidence
      if (weekIndex < 4) return 'medium';
      // Rest are low confidence
      return 'low';
    }
    
    // Default confidence levels based on week number
    if (weekIndex < 4) return 'high';
    if (weekIndex < 8) return 'medium';
    return 'low';
  };

  for (let i = 0; i < numWeeks; i++) {
    const weekNumber = i + 1;
    const weekStart = addDays(startDate, i * 7);
    const weekEnd = addDays(weekStart, 6);
    
    // Starting balance for this week is the running balance
    const startingBalance = runningBalance;
    
    // Check if we have AI prediction for this week
    const aiPrediction = aiPredictions.find(p => p.weekNumber === weekNumber);
    
    let predictedInflows, predictedOutflows, confidenceScore;
    
    if (aiPrediction) {
      // Use AI predictions if available
      predictedInflows = aiPrediction.predictedInflows;
      predictedOutflows = aiPrediction.predictedOutflows;
      confidenceScore = aiPrediction.confidenceScore;
      
      // If AI also provided balance calculations
      if (aiPrediction.startingBalance !== undefined && aiPrediction.endingBalance !== undefined) {
        // If this is the first week, and we're using current balance, ensure AI starting balance matches
        if (i === 0 && config?.startWithCurrentBalance) {
          runningBalance = initialAvailableCashBalance;
          console.log("[DEBUG - Edge Function - Balance Tracking] Using initial balance for first week:", runningBalance);
        } else if (aiPrediction.startingBalance !== undefined) {
          // Otherwise use AI's starting balance
          runningBalance = aiPrediction.startingBalance;
        }
      }
      
      // Add credit payment to outflows if this week has credit payments
      if (creditPaymentsByWeek.has(weekNumber) && config?.includeCreditPayments) {
        predictedOutflows += creditPaymentsByWeek.get(weekNumber);
      }
    } else {
      // Fall back to statistical model
      
      // Add some variation and trends
      const growthFactor = config?.includeHistoricalTrends 
        ? 1 + (i * 0.01) // Small growth each week
        : 1;
        
      // Add seasonal variation if configured
      const seasonalFactor = config?.includeSeasonality 
        ? 1 + (0.1 * Math.sin(i * Math.PI / 6)) // Sine wave over approximately 3 months
        : 1;
        
      // Add random variation - reduce randomness for rolling forecasts
      const randomVariationRange = config?.useRollingForecast ? 0.1 : 0.2; // +/- 5% for rolling, 10% for normal
      const randomVariation = 1 - (randomVariationRange/2) + (Math.random() * randomVariationRange);
      
      predictedInflows = Math.round(baseInflow * growthFactor * seasonalFactor * randomVariation);
      
      // Adjust outflows based on configuration
      let outflowAdjustment = 1;
      if (config?.includePendingPayables && historicalData.payables.length > 0) {
        outflowAdjustment *= 1.05; // Increase outflows by 5% if including pending payables
      }
      if (config?.includeRecurringExpenses && historicalData.expenses.length > 0) {
        outflowAdjustment *= 1.03; // Increase outflows by 3% if including recurring expenses
      }
      
      predictedOutflows = Math.round(baseOutflow * (1 + (i * 0.005)) * seasonalFactor * randomVariation * outflowAdjustment);
      
      // Add credit payment to outflows if this week has credit payments
      if (creditPaymentsByWeek.has(weekNumber) && config?.includeCreditPayments) {
        predictedOutflows += creditPaymentsByWeek.get(weekNumber);
      }
      
      // Confidence decreases with time and is higher with more historical data
      const dataFactor = Math.min(1, (historicalData.payables.length + historicalData.receivables.length + 
                                    historicalData.expenses.length + historicalData.sales.length) / 40);
      confidenceScore = Math.round((0.9 - (i * 0.02)) * dataFactor * 100) / 100;
    }
    
    // Calculate ending balance
    const netCashFlow = predictedInflows - predictedOutflows;
    const endingBalance = startingBalance + netCashFlow;
    
    // Update running balance for next week
    runningBalance = endingBalance;
    
    if (i === 0) {
      console.log("[DEBUG - Edge Function - Balance Tracking] First week calculation:", {
        weekNumber,
        startingBalance,
        predictedInflows,
        predictedOutflows,
        netCashFlow,
        endingBalance,
        balanceConfidence: determineBalanceConfidence(i)
      });
    }
    
    // For rolling forecasts, mark if this week is reconciled with actual data
    const isReconciled = config?.useRollingForecast && i === 0 && config?.reconcileBalances;
    
    weeks.push({
      forecast_id: forecastId,
      week_number: weekNumber,
      week_start_date: format(weekStart, 'yyyy-MM-dd'),
      week_end_date: format(weekEnd, 'yyyy-MM-dd'),
      predicted_inflows: predictedInflows,
      predicted_outflows: predictedOutflows,
      confidence_score: confidenceScore,
      starting_balance: startingBalance,
      ending_balance: endingBalance,
      balance_confidence: determineBalanceConfidence(i),
      is_reconciled: isReconciled
    });
  }
  
  console.log("[DEBUG - Edge Function - Balance Tracking] Generated weeks summary:", {
    weeksCount: weeks.length,
    firstWeekStartingBalance: weeks[0]?.starting_balance,
    firstWeekEndingBalance: weeks[0]?.ending_balance,
    lastWeekStartingBalance: weeks[weeks.length - 1]?.starting_balance,
    lastWeekEndingBalance: weeks[weeks.length - 1]?.ending_balance
  });
  
  return weeks;
}
