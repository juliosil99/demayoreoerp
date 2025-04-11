
export interface ForecastDataCount {
  payables: number;
  receivables: number;
  expenses: number;
  sales: number;
  bankAccounts: number;
  bankAccountsCount?: number; // For compatibility with older code
}

export interface ForecastOptions {
  useAI: boolean;
  includeHistoricalTrends: boolean;
  includeSeasonality: boolean;
  includePendingPayables: boolean;
  includeRecurringExpenses: boolean;
  forecastHorizonWeeks?: number; // Number of weeks to forecast
  confidenceLevel?: number; // Confidence level for predictions (0-1)
}
