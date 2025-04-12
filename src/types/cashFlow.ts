
export interface CashFlowForecast {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  created_at: string;
  status: string;
  ai_insights?: string;
  config?: Record<string, any>;
  user_id: string;
  initial_balance?: number;
  available_cash_balance?: number;
  credit_liabilities?: number;
  net_position?: number;
  upcoming_credit_payments?: CreditPayment[];
  last_reconciled_date?: string;
  is_balance_confirmed?: boolean;
}

export interface CreditPayment {
  accountId: number;
  accountName: string;
  amount: number;
  dueDate: string;
  type: string;
}

export interface ForecastWeek {
  id: string;
  forecast_id: string;
  week_number: number;
  week_start_date: string;
  week_end_date: string;
  predicted_inflows: number;
  predicted_outflows: number;
  actual_inflows?: number;
  actual_outflows?: number;
  notes?: string;
  confidence_score?: number;
  net_cash_flow?: number; // Calculated field
  cumulative_cash_flow?: number; // Calculated field
  starting_balance?: number; // Starting balance for the week
  ending_balance?: number; // Ending balance for the week
  balance_confidence?: 'high' | 'medium' | 'low'; // Confidence in the balance data
  is_reconciled?: boolean; // Whether this week has been reconciled with actual data
}

export interface ForecastItem {
  id: string;
  forecast_id: string;
  week_id: string;
  category: string;
  amount: number;
  description?: string;
  is_recurring?: boolean;
  confidence_score?: number;
  type: 'inflow' | 'outflow';
  source: 'historical' | 'ai_predicted' | 'manual' | 'recurring' | 'reconciled';
  transaction_date?: string;
  is_confirmed?: boolean;
}

export interface ForecastHistoricalData {
  payables: any[];
  receivables: any[];
  expenses: any[];
  sales: any[];
  bankAccounts: any[];
  availableCashBalance?: number;
  creditLiabilities?: number;
  netPosition?: number;
  upcomingCreditPayments?: CreditPayment[];
  balance_history?: BalanceHistoryEntry[];
}

export interface BalanceHistoryEntry {
  date: string;
  availableCashBalance: number;
  creditLiabilities: number;
  netPosition: number;
  is_confirmed: boolean;
}

export interface ForecastRequest {
  forecastId: string;
  startDate: string;
  historicalData: ForecastHistoricalData;
  config?: Record<string, any>;
}

export interface ForecastResponse {
  success: boolean;
  forecast?: ForecastWeek[];
  insights?: string;
  error?: string;
}

export interface ChartData {
  name: string; // Week label
  inflows: number;
  outflows: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  balance?: number; // Added for bank balance tracking
  confidence?: 'high' | 'medium' | 'low'; // Added for data confidence
}
