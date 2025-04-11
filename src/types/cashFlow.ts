
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
  source: 'historical' | 'ai_predicted' | 'manual' | 'recurring';
}

export interface ForecastHistoricalData {
  payables: any[];
  receivables: any[];
  expenses: any[];
  sales: any[];
  bankAccounts: any[];
  totalBankBalance?: number;
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
}
