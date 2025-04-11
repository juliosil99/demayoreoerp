
export interface ForecastDataCount {
  payables: number;
  receivables: number;
  expenses: number;
  sales: number;
  bankAccounts: number;
  bankAccountsCount?: number; // For compatibility with older code
  totalBankBalance?: number;  // Added to store total bank balance
}

export interface ForecastOptions {
  useAI: boolean;
  includeHistoricalTrends: boolean;
  includeSeasonality: boolean;
  includePendingPayables: boolean;
  includeRecurringExpenses: boolean;
  forecastHorizonWeeks?: number; // Number of weeks to forecast
  confidenceLevel?: number; // Confidence level for predictions (0-1)
  startWithCurrentBalance?: boolean; // Whether to start forecast with current bank balances
}

// New interface to represent weekly cash balance
export interface WeeklyBalance {
  startingBalance: number;
  endingBalance: number;
  inflows: number;
  outflows: number;
  netCashFlow: number;
}
