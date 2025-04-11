
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
}
