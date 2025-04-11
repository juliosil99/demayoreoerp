
/**
 * Helper function to create AI prompt based on historical data and configuration
 */
export function createAIPrompt(historicalData: any, config: any) {
  return `
Please analyze the following financial data and provide a ${config.forecastHorizonWeeks || 13}-week cash flow forecast with insights.

INITIAL BANK BALANCE: ${historicalData.totalBankBalance}

HISTORICAL FINANCIAL DATA SUMMARY:
${JSON.stringify(historicalData, null, 2)}

CONFIGURATION OPTIONS:
- Include Historical Trends: ${config.includeHistoricalTrends ? 'Yes' : 'No'}
- Include Seasonality: ${config.includeSeasonality ? 'Yes' : 'No'}
- Include Pending Payables: ${config.includePendingPayables ? 'Yes' : 'No'}
- Include Recurring Expenses: ${config.includeRecurringExpenses ? 'Yes' : 'No'}
- Start with Current Bank Balance: ${config.startWithCurrentBalance ? 'Yes' : 'No'}
- Forecast Horizon Weeks: ${config.forecastHorizonWeeks || 13}

Please provide the following in JSON format:
1. "insights": A detailed analysis of the cash flow forecast, with key observations and recommendations.
2. "weeklyForecasts": An array of weekly forecasts with the following structure for each week:
   - weekNumber: The week number (1-${config.forecastHorizonWeeks || 13})
   - predictedInflows: Predicted cash inflows for the week
   - predictedOutflows: Predicted cash outflows for the week
   - startingBalance: Starting balance for the week (considering previous week's ending balance)
   - endingBalance: Ending balance for the week (starting balance + inflows - outflows)
   - confidenceScore: A confidence score between 0-1 for the prediction

Your response should be valid JSON with "insights" and "weeklyForecasts" keys.
`;
}
