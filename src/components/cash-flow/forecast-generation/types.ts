
export interface ForecastDataCount {
  payables: number;
  receivables: number;
  expenses: number;
  sales: number;
  bankAccounts: number;
  bankAccountsCount?: number; // For compatibility with older code
  totalBankBalance?: number;  // Added to store total bank balance
  availableCashBalance?: number; // Available cash (Bank + Cash accounts)
  creditLiabilities?: number;  // Credit liabilities (Credit Card + Credit Simple accounts)
  netPosition?: number;         // Net position (availableCashBalance + creditLiabilities)
}

export interface ForecastOptions {
  useAI: boolean;
  includeHistoricalTrends: boolean;
  includeSeasonality: boolean;
  includePendingPayables: boolean;
  includeRecurringExpenses: boolean;
  includeCreditPayments: boolean; // Whether to include credit card payments in the forecast
  startWithCurrentBalance: boolean; // Whether to start forecast with current bank balances
  forecastHorizonWeeks?: number; // Number of weeks to forecast
  confidenceLevel?: number; // Confidence level for predictions (0-1)
}

// New interface to represent weekly cash balance
export interface WeeklyBalance {
  startingBalance: number;
  endingBalance: number;
  inflows: number;
  outflows: number;
  netCashFlow: number;
}
