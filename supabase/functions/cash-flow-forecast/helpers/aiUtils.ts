
/**
 * Helper function to create AI prompt based on historical data and configuration
 */
export function createAIPrompt(historicalData: any, config: any) {
  return `
Please analyze the following financial data and generate a detailed ${config.forecastHorizonWeeks || 13}-week **cash flow forecast**. Your forecast must consider actual and forecasted cash inflows and outflows, while also identifying key financial risks and opportunities.

### INPUTS:
**Initial Financial Position**:
- Available Cash Balance: ${historicalData.availableCashBalance || 0}
- Credit Liabilities: ${historicalData.creditLiabilities || 0}
- Net Position: ${historicalData.netPosition || 0}

**Historical Financial Data** (sales, expenses, past inflows/outflows, categorized):
${JSON.stringify({
  payables: historicalData.weeklyScheduledPayables || [],
  receivables: historicalData.weeklyScheduledReceivables || [],
  creditPayments: historicalData.weeklyScheduledCreditPayments || [],
  expenses: historicalData.expenses || [],
  sales: historicalData.sales || []
}, null, 2)}

**Detailed Upcoming Cash Flows:**
1. Scheduled Payables by Week:
${JSON.stringify(historicalData.weeklyScheduledPayables || [], null, 2)}

2. Credit/Loan Payments by Week:
${JSON.stringify(historicalData.weeklyScheduledCreditPayments || [], null, 2)}

3. Expected Receivables by Week:
${JSON.stringify(historicalData.weeklyScheduledReceivables || [], null, 2)}

**Configuration Settings:**
- Use Historical Trends: ${config.includeHistoricalTrends ? 'Yes' : 'No'}
- Consider Seasonality: ${config.includeSeasonality ? 'Yes' : 'No'}
- Include Pending Payables: ${config.includePendingPayables ? 'Yes' : 'No'}
- Detect and Project Recurring Expenses: ${config.includeRecurringExpenses ? 'Yes' : 'No'}
- Include Credit Payments: ${config.includeCreditPayments ? 'Yes' : 'No'}
- Forecast Horizon: ${config.forecastHorizonWeeks || 13} weeks
- Starting Balance: Use current balance = ${config.startWithCurrentBalance ? 'Yes' : 'No'}

### TASKS:

**1. Forecast Logic Requirements:**
- Each week MUST have DIFFERENT inflow/outflow amounts based on:
  * Actual scheduled payments due that specific week
  * Credit/loan payments due that specific week
  * Recurring expense patterns identified for that week
  * Expected receivables for that week
  * Historical sales patterns adjusted for that week
- DO NOT generate identical values across weeks
- Factor in seasonal patterns if enabled
- Account for identified recurring expenses
- Incorporate growth/decline trends from historical data

**2. Week-by-Week Analysis Requirements:**
For each week, you MUST:
1. Start with confirmed scheduled payments for that specific week
2. Add predicted recurring expenses based on historical patterns
3. Include credit/loan payments due that week
4. Calculate expected inflows from:
   - Confirmed receivables due that week
   - Sales predictions based on historical trends
5. Assign confidence scores based on:
   - % of outflows that are confirmed scheduled payments
   - Quality of historical data for that week
   - Distance into the future (near-term predictions = higher confidence)

**3. Output Requirements**
Return valid JSON with:
{
  "insights": [
    {
      "title": "Risk Alert: Week 4 Cash Gap",
      "description": "Details about identified risk or opportunity"
    }
  ],
  "weeklyForecasts": [
    {
      "weekNumber": 1,
      "predictedInflows": 50000,
      "predictedOutflows": 45000,
      "confidenceScore": 0.95,
      "details": {
        "scheduled_payments": 30000,
        "recurring_expenses": 10000,
        "credit_payments": 5000,
        "confirmed_receivables": 40000,
        "projected_sales": 10000
      }
    }
  ]
}

IMPORTANT REQUIREMENTS:
1. Each week MUST have different amounts based on actual scheduled payments and receivables
2. DO NOT copy-paste values between weeks
3. Generate specific insights about cash flow risks and opportunities
4. Assign realistic confidence scores (0-1) based on data quality and predictability
`;
}

