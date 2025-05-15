
export type FinancialPeriodType = 'day' | 'month' | 'quarter' | 'year';

export interface FinancialPeriod {
  id: string;
  period_type: FinancialPeriodType;
  start_date: string;
  end_date: string;
  is_closed: boolean;
  closed_at?: string;
  year: number;
  period: number; // month number, quarter number, or day of month
  user_id: string;
}

export interface AccountBalance {
  id: string;
  account_id: string;
  period_id: string;
  balance: number;
  user_id: string;
}

export interface FinancialStatementConfig {
  id: string;
  statement_type: 'income_statement' | 'balance_sheet' | 'cash_flow';
  name: string;
  config: {
    sections: {
      name: string;
      accountTypes: string[];
      sign: number;
    }[];
  };
  user_id: string;
}

export interface FinancialReportOptions {
  periodType: FinancialPeriodType;
  periodId?: string;
  year?: number;  // Made optional since we can use periodId instead
  period?: number;
  compareWithPreviousYear?: boolean;
}

export interface ReportData {
  currentPeriod: {
    startDate: string;
    endDate: string;
    data: Record<string, number>;
  };
  previousPeriod?: {
    startDate: string;
    endDate: string;
    data: Record<string, number>;
  };
}
