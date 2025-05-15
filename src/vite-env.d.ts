
/// <reference types="vite/client" />

// Supabase custom type augmentation for tables that don't exist in the generated types yet
declare namespace Database {
  interface Tables {
    financial_periods: {
      Row: {
        id: string;
        period_type: 'day' | 'month' | 'quarter' | 'year';
        start_date: string;
        end_date: string;
        is_closed: boolean;
        closed_at?: string;
        year: number;
        period: number;
        user_id: string;
        created_at?: string;
        updated_at?: string;
      };
      Insert: {
        id?: string;
        period_type: 'day' | 'month' | 'quarter' | 'year';
        start_date: string;
        end_date: string;
        is_closed?: boolean;
        closed_at?: string;
        year: number;
        period: number;
        user_id: string;
      };
      Update: {
        is_closed?: boolean;
        closed_at?: string;
      };
    };
    account_balances: {
      Row: {
        id: string;
        account_id: string;
        period_id: string;
        balance: number;
        user_id: string;
        created_at?: string;
        updated_at?: string;
        chart_of_accounts?: {
          name: string;
          account_type: string;
          code: string;
        };
      };
      Insert: {
        id?: string;
        account_id: string;
        period_id: string;
        balance: number;
        user_id: string;
      };
      Update: {
        balance?: number;
      };
    };
    financial_statement_configs: {
      Row: {
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
        created_at?: string;
        updated_at?: string;
      };
      Insert: {
        id?: string;
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
      };
      Update: {
        name?: string;
        config?: {
          sections: {
            name: string;
            accountTypes: string[];
            sign: number;
          }[];
        };
      };
    };
  }
}
