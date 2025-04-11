import { format } from "https://esm.sh/date-fns@4.1.0";
import { addDays } from "https://esm.sh/date-fns@4.1.0";
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
  initialBankBalance: number = 0
) {
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
  let runningBalance = config?.startWithCurrentBalance ? initialBankBalance : 0;

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
          runningBalance = initialBankBalance;
        } else if (aiPrediction.startingBalance !== undefined) {
          // Otherwise use AI's starting balance
          runningBalance = aiPrediction.startingBalance;
        }
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
        
      // Add random variation
      const randomVariation = 0.9 + (Math.random() * 0.2); // +/- 10% random variation
      
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
    
    weeks.push({
      forecast_id: forecastId,
      week_number: weekNumber,
      week_start_date: format(weekStart, 'yyyy-MM-dd'),
      week_end_date: format(weekEnd, 'yyyy-MM-dd'),
      predicted_inflows: predictedInflows,
      predicted_outflows: predictedOutflows,
      confidence_score: confidenceScore,
      starting_balance: startingBalance,
      ending_balance: endingBalance
    });
  }
  
  return weeks;
}
