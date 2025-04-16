
/**
 * Helper function to create AI prompt based on historical data and configuration
 */
export function createAIPrompt(historicalData: any, config: any) {
  return `
Please analyze the following financial data and provide a detailed ${config.forecastHorizonWeeks || 13}-week cash flow forecast with insights.

INITIAL BANK BALANCE: ${historicalData.availableCashBalance || 0}
CREDIT LIABILITIES: ${historicalData.creditLiabilities || 0}
NET POSITION: ${historicalData.netPosition || 0}

HISTORICAL FINANCIAL DATA SUMMARY:
${JSON.stringify(historicalData, null, 2)}

FORECASTING INSTRUCTIONS:
1. First, map all scheduled payments (payables and credit payments) to their specific due weeks.
2. For each week, start with these confirmed scheduled outflows.
3. Analyze expense patterns from historical data to identify recurring expenses and their timing.
4. For sales/inflows, analyze both scheduled receivables and historical sales trends.
5. Apply growth/decline trends identified in historical data.
6. Factor in seasonality if relevant and configured.
7. Each week should have DIFFERENT predicted amounts based on:
   - Scheduled payables due that specific week
   - Credit payments due that specific week
   - Recurring expense patterns falling in that week
   - Historical sales patterns and receivables for that week

CONFIGURATION OPTIONS:
- Include Historical Trends: ${config.includeHistoricalTrends ? 'Yes' : 'No'}
- Include Seasonality: ${config.includeSeasonality ? 'Yes' : 'No'}
- Include Pending Payables: ${config.includePendingPayables ? 'Yes' : 'No'}
- Include Recurring Expenses: ${config.includeRecurringExpenses ? 'Yes' : 'No'}
- Include Credit Payments: ${config.includeCreditPayments ? 'Yes' : 'No'}
- Start with Current Bank Balance: ${config.startWithCurrentBalance ? 'Yes' : 'No'}
- Forecast Horizon Weeks: ${config.forecastHorizonWeeks || 13}

Please provide the following in JSON format:
1. "insights": A detailed analysis of the cash flow forecast, with key observations and recommendations.
2. "weeklyForecasts": An array of weekly forecasts with the following structure for each week:
   - weekNumber: The week number (1-${config.forecastHorizonWeeks || 13})
   - predictedInflows: Predicted cash inflows for the week (MUST VARY by week based on data)
   - predictedOutflows: Predicted cash outflows for the week (MUST VARY by week based on scheduled payments)
   - confidenceScore: A confidence score between 0-1 for the prediction

IMPORTANT: DO NOT generate identical values across weeks. Each week's inflows and outflows MUST reflect the specific payments, expenses, and income expected for that particular week based on the provided data.

Your response should be valid JSON with "insights" and "weeklyForecasts" keys.
`;
}
