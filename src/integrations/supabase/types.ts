export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_balances: {
        Row: {
          account_id: string
          balance: number
          created_at: string | null
          id: string
          period_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          balance?: number
          created_at?: string | null
          id?: string
          period_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          balance?: number
          created_at?: string | null
          id?: string
          period_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_balances_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_balances_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "financial_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      account_transfers: {
        Row: {
          amount: number
          amount_from: number
          amount_to: number
          created_at: string | null
          date: string
          exchange_rate: number
          from_account_id: number
          id: string
          notes: string | null
          reference_number: string | null
          status: string | null
          to_account_id: number
          user_id: string
        }
        Insert: {
          amount: number
          amount_from?: number
          amount_to?: number
          created_at?: string | null
          date: string
          exchange_rate?: number
          from_account_id: number
          id?: string
          notes?: string | null
          reference_number?: string | null
          status?: string | null
          to_account_id: number
          user_id: string
        }
        Update: {
          amount?: number
          amount_from?: number
          amount_to?: number
          created_at?: string | null
          date?: string
          exchange_rate?: number
          from_account_id?: number
          id?: string
          notes?: string | null
          reference_number?: string | null
          status?: string | null
          to_account_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_transfers_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_from_account"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_to_account"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_adjustments: {
        Row: {
          amount: number
          chart_account_id: string
          created_at: string | null
          expense_id: string | null
          id: string
          invoice_id: number | null
          notes: string | null
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          chart_account_id: string
          created_at?: string | null
          expense_id?: string | null
          id?: string
          invoice_id?: number | null
          notes?: string | null
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          chart_account_id?: string
          created_at?: string | null
          expense_id?: string | null
          id?: string
          invoice_id?: number | null
          notes?: string | null
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_adjustments_chart_account_id_fkey"
            columns: ["chart_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_adjustments_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_adjustments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_payable: {
        Row: {
          amount: number
          chart_account_id: string | null
          client_id: string | null
          created_at: string | null
          due_date: string
          expense_id: string | null
          id: string
          invoice_id: number | null
          is_recurring: boolean | null
          notes: string | null
          parent_payable_id: string | null
          payment_id: string | null
          payment_term: number
          recurrence_day: number | null
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          series_number: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          chart_account_id?: string | null
          client_id?: string | null
          created_at?: string | null
          due_date: string
          expense_id?: string | null
          id?: string
          invoice_id?: number | null
          is_recurring?: boolean | null
          notes?: string | null
          parent_payable_id?: string | null
          payment_id?: string | null
          payment_term?: number
          recurrence_day?: number | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          series_number?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          chart_account_id?: string | null
          client_id?: string | null
          created_at?: string | null
          due_date?: string
          expense_id?: string | null
          id?: string
          invoice_id?: number | null
          is_recurring?: boolean | null
          notes?: string | null
          parent_payable_id?: string | null
          payment_id?: string | null
          payment_term?: number
          recurrence_day?: number | null
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          series_number?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_chart_account_id_fkey"
            columns: ["chart_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_parent_payable_id_fkey"
            columns: ["parent_payable_id"]
            isOneToOne: false
            referencedRelation: "accounts_payable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          created_by: string
          id: string
          key_name: string
          key_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          key_name: string
          key_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          key_name?: string
          key_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          balance: number | null
          balance_date: string | null
          created_at: string | null
          credit_limit: number | null
          currency: string
          id: number
          initial_balance: number | null
          interest_rate: number | null
          loan_start_date: string | null
          minimum_payment_percentage: number | null
          monthly_payment: number | null
          name: string
          original_loan_amount: number | null
          payment_due_day: number | null
          remaining_months: number | null
          statement_cut_day: number | null
          total_term_months: number | null
          type: string
        }
        Insert: {
          balance?: number | null
          balance_date?: string | null
          created_at?: string | null
          credit_limit?: number | null
          currency?: string
          id?: number
          initial_balance?: number | null
          interest_rate?: number | null
          loan_start_date?: string | null
          minimum_payment_percentage?: number | null
          monthly_payment?: number | null
          name: string
          original_loan_amount?: number | null
          payment_due_day?: number | null
          remaining_months?: number | null
          statement_cut_day?: number | null
          total_term_months?: number | null
          type: string
        }
        Update: {
          balance?: number | null
          balance_date?: string | null
          created_at?: string | null
          credit_limit?: number | null
          currency?: string
          id?: number
          initial_balance?: number | null
          interest_rate?: number | null
          loan_start_date?: string | null
          minimum_payment_percentage?: number | null
          monthly_payment?: number | null
          name?: string
          original_loan_amount?: number | null
          payment_due_day?: number | null
          remaining_months?: number | null
          statement_cut_day?: number | null
          total_term_months?: number | null
          type?: string
        }
        Relationships: []
      }
      bank_statements: {
        Row: {
          account_id: number
          content_type: string
          description: string | null
          file_path: string
          filename: string
          id: string
          month: number
          size: number
          upload_date: string
          user_id: string
          year: number
        }
        Insert: {
          account_id: number
          content_type: string
          description?: string | null
          file_path: string
          filename: string
          id?: string
          month: number
          size: number
          upload_date?: string
          user_id: string
          year: number
        }
        Update: {
          account_id?: number
          content_type?: string
          description?: string | null
          file_path?: string
          filename?: string
          id?: string
          month?: number
          size?: number
          upload_date?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "bank_statements_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_flow_forecasts: {
        Row: {
          ai_insights: string | null
          available_cash_balance: number | null
          config: Json | null
          created_at: string
          credit_liabilities: number | null
          description: string | null
          id: string
          initial_balance: number | null
          is_balance_confirmed: boolean | null
          is_rolling: boolean | null
          last_reconciled_date: string | null
          last_updated: string | null
          name: string
          net_position: number | null
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          ai_insights?: string | null
          available_cash_balance?: number | null
          config?: Json | null
          created_at?: string
          credit_liabilities?: number | null
          description?: string | null
          id?: string
          initial_balance?: number | null
          is_balance_confirmed?: boolean | null
          is_rolling?: boolean | null
          last_reconciled_date?: string | null
          last_updated?: string | null
          name: string
          net_position?: number | null
          start_date: string
          status?: string
          user_id: string
        }
        Update: {
          ai_insights?: string | null
          available_cash_balance?: number | null
          config?: Json | null
          created_at?: string
          credit_liabilities?: number | null
          description?: string | null
          id?: string
          initial_balance?: number | null
          is_balance_confirmed?: boolean | null
          is_rolling?: boolean | null
          last_reconciled_date?: string | null
          last_updated?: string | null
          name?: string
          net_position?: number | null
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          account_type: string
          account_use: string | null
          code: string
          created_at: string | null
          id: string
          is_group: boolean | null
          level: number
          name: string
          parent_id: string | null
          path: string | null
          sat_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_type: string
          account_use?: string | null
          code: string
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          level: number
          name: string
          parent_id?: string | null
          path?: string | null
          sat_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_type?: string
          account_use?: string | null
          code?: string
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          level?: number
          name?: string
          parent_id?: string | null
          path?: string | null
          sat_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          codigo_postal: string
          created_at: string | null
          id: string
          nombre: string
          regimen_fiscal: string
          rfc: string
          user_id: string
        }
        Insert: {
          codigo_postal: string
          created_at?: string | null
          id?: string
          nombre: string
          regimen_fiscal: string
          rfc: string
          user_id: string
        }
        Update: {
          codigo_postal?: string
          created_at?: string | null
          id?: string
          nombre?: string
          regimen_fiscal?: string
          rfc?: string
          user_id?: string
        }
        Relationships: []
      }
      company_users: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          created_at: string | null
          default_chart_account_id: string | null
          id: string
          name: string
          phone: string | null
          postal_code: string
          rfc: string
          tax_regime: string
          type: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          default_chart_account_id?: string | null
          id?: string
          name: string
          phone?: string | null
          postal_code: string
          rfc: string
          tax_regime: string
          type: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          default_chart_account_id?: string | null
          id?: string
          name?: string
          phone?: string | null
          postal_code?: string
          rfc?: string
          tax_regime?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_default_chart_account_id_fkey"
            columns: ["default_chart_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_payment_schedules: {
        Row: {
          account_id: number
          amount: number
          created_at: string | null
          due_date: string
          id: string
          payment_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          account_id: number
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          payment_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          account_id?: number
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          payment_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_payment_schedules_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_payment_schedules_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "account_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      diot_configurations: {
        Row: {
          created_at: string | null
          id: string
          operation_type: string
          supplier_id: string
          tax_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          operation_type: string
          supplier_id: string
          tax_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          operation_type?: string
          supplier_id?: string
          tax_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_supplier_id"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          name: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          name: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      expense_deletion_logs: {
        Row: {
          account_id: number | null
          amount: number | null
          deleted_at: string | null
          expense_id: string | null
          id: string
        }
        Insert: {
          account_id?: number | null
          amount?: number | null
          deleted_at?: string | null
          expense_id?: string | null
          id?: string
        }
        Update: {
          account_id?: number | null
          amount?: number | null
          deleted_at?: string | null
          expense_id?: string | null
          id?: string
        }
        Relationships: []
      }
      expense_imports: {
        Row: {
          created_at: string | null
          error_message: string | null
          filename: string
          id: string
          processed_rows: number | null
          status: string
          total_rows: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          filename: string
          id?: string
          processed_rows?: number | null
          status?: string
          total_rows?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          filename?: string
          id?: string
          processed_rows?: number | null
          status?: string
          total_rows?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expense_invoice_relations: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string
          exchange_rate: number
          expense_id: string
          id: string
          invoice_id: number
          original_amount: number | null
          paid_amount: number | null
          reconciled_amount: number | null
          tax_details: Json | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string
          exchange_rate?: number
          expense_id: string
          id?: string
          invoice_id: number
          original_amount?: number | null
          paid_amount?: number | null
          reconciled_amount?: number | null
          tax_details?: Json | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string
          exchange_rate?: number
          expense_id?: string
          id?: string
          invoice_id?: number
          original_amount?: number | null
          paid_amount?: number | null
          reconciled_amount?: number | null
          tax_details?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_invoice_relations_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_invoice_relations_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          account_id: number
          amount: number
          category: string | null
          chart_account_id: string
          created_at: string | null
          currency: string
          date: string
          description: string
          exchange_rate: number
          id: string
          notes: string | null
          original_amount: number
          payment_method: string
          reconciled: boolean | null
          reconciliation_date: string | null
          reconciliation_type: string | null
          reference_number: string | null
          supplier_id: string | null
          tax_regime: string | null
          user_id: string
        }
        Insert: {
          account_id: number
          amount: number
          category?: string | null
          chart_account_id: string
          created_at?: string | null
          currency?: string
          date: string
          description: string
          exchange_rate?: number
          id?: string
          notes?: string | null
          original_amount: number
          payment_method: string
          reconciled?: boolean | null
          reconciliation_date?: string | null
          reconciliation_type?: string | null
          reference_number?: string | null
          supplier_id?: string | null
          tax_regime?: string | null
          user_id: string
        }
        Update: {
          account_id?: number
          amount?: number
          category?: string | null
          chart_account_id?: string
          created_at?: string | null
          currency?: string
          date?: string
          description?: string
          exchange_rate?: number
          id?: string
          notes?: string | null
          original_amount?: number
          payment_method?: string
          reconciled?: boolean | null
          reconciliation_date?: string | null
          reconciliation_type?: string | null
          reference_number?: string | null
          supplier_id?: string | null
          tax_regime?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_chart_account_id_fkey"
            columns: ["chart_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_periods: {
        Row: {
          closed_at: string | null
          created_at: string | null
          end_date: string
          id: string
          is_closed: boolean
          period: number
          period_type: string
          start_date: string
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          is_closed?: boolean
          period: number
          period_type: string
          start_date: string
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          is_closed?: boolean
          period?: number
          period_type?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      financial_statement_configs: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          name: string
          statement_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string | null
          id?: string
          name: string
          statement_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          name?: string
          statement_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      forecast_items: {
        Row: {
          amount: number
          category: string
          confidence_score: number | null
          description: string | null
          forecast_id: string
          id: string
          is_recurring: boolean | null
          source: string
          type: string
          week_id: string
        }
        Insert: {
          amount: number
          category: string
          confidence_score?: number | null
          description?: string | null
          forecast_id: string
          id?: string
          is_recurring?: boolean | null
          source: string
          type: string
          week_id: string
        }
        Update: {
          amount?: number
          category?: string
          confidence_score?: number | null
          description?: string | null
          forecast_id?: string
          id?: string
          is_recurring?: boolean | null
          source?: string
          type?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forecast_items_forecast_id_fkey"
            columns: ["forecast_id"]
            isOneToOne: false
            referencedRelation: "cash_flow_forecasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forecast_items_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "forecast_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_weeks: {
        Row: {
          actual_inflows: number | null
          actual_outflows: number | null
          balance_confidence: string | null
          confidence_score: number | null
          ending_balance: number | null
          forecast_id: string
          id: string
          is_reconciled: boolean | null
          notes: string | null
          predicted_inflows: number | null
          predicted_outflows: number | null
          starting_balance: number | null
          week_end_date: string
          week_number: number
          week_start_date: string
        }
        Insert: {
          actual_inflows?: number | null
          actual_outflows?: number | null
          balance_confidence?: string | null
          confidence_score?: number | null
          ending_balance?: number | null
          forecast_id: string
          id?: string
          is_reconciled?: boolean | null
          notes?: string | null
          predicted_inflows?: number | null
          predicted_outflows?: number | null
          starting_balance?: number | null
          week_end_date: string
          week_number: number
          week_start_date: string
        }
        Update: {
          actual_inflows?: number | null
          actual_outflows?: number | null
          balance_confidence?: string | null
          confidence_score?: number | null
          ending_balance?: number | null
          forecast_id?: string
          id?: string
          is_reconciled?: boolean | null
          notes?: string | null
          predicted_inflows?: number | null
          predicted_outflows?: number | null
          starting_balance?: number | null
          week_end_date?: string
          week_number?: number
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "forecast_weeks_forecast_id_fkey"
            columns: ["forecast_id"]
            isOneToOne: false
            referencedRelation: "cash_flow_forecasts"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_logs: {
        Row: {
          attempted_by: string
          created_at: string
          error_message: string | null
          id: string
          invitation_id: string | null
          status: string
        }
        Insert: {
          attempted_by: string
          created_at?: string
          error_message?: string | null
          id?: string
          invitation_id?: string | null
          status: string
        }
        Update: {
          attempted_by?: string
          created_at?: string
          error_message?: string | null
          id?: string
          invitation_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_logs_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "user_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_products: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          id: number
          invoice_id: number | null
          product_key: string | null
          quantity: number | null
          unit: string | null
          unit_key: string | null
          unit_value: number | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          invoice_id?: number | null
          product_key?: string | null
          quantity?: number | null
          unit?: string | null
          unit_key?: string | null
          unit_value?: number | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          invoice_id?: number | null
          product_key?: string | null
          quantity?: number | null
          unit?: string | null
          unit_key?: string | null
          unit_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_products_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          certificate_number: string | null
          cfdi_stamp: string | null
          complement_type: string | null
          content_type: string | null
          created_at: string | null
          currency: string | null
          exchange_rate: number | null
          file_path: string
          filename: string
          global_periodic_number: string | null
          id: number
          invoice_date: string | null
          invoice_effect: string | null
          invoice_number: string | null
          invoice_type: string | null
          issuer_name: string | null
          issuer_rfc: string | null
          issuer_tax_regime: string | null
          month_period: number | null
          paid_amount: number | null
          payment_form: string | null
          payment_method: string | null
          processed: boolean | null
          receiver_cfdi_use: string | null
          receiver_name: string | null
          receiver_rfc: string | null
          receiver_tax_regime: string | null
          receiver_zip_code: string | null
          sat_certificate_number: string | null
          sat_stamp: string | null
          serie: string | null
          size: number | null
          stamp_date: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          uuid: string | null
          version: string | null
          xml_content: string | null
          year_period: number | null
        }
        Insert: {
          certificate_number?: string | null
          cfdi_stamp?: string | null
          complement_type?: string | null
          content_type?: string | null
          created_at?: string | null
          currency?: string | null
          exchange_rate?: number | null
          file_path: string
          filename: string
          global_periodic_number?: string | null
          id?: number
          invoice_date?: string | null
          invoice_effect?: string | null
          invoice_number?: string | null
          invoice_type?: string | null
          issuer_name?: string | null
          issuer_rfc?: string | null
          issuer_tax_regime?: string | null
          month_period?: number | null
          paid_amount?: number | null
          payment_form?: string | null
          payment_method?: string | null
          processed?: boolean | null
          receiver_cfdi_use?: string | null
          receiver_name?: string | null
          receiver_rfc?: string | null
          receiver_tax_regime?: string | null
          receiver_zip_code?: string | null
          sat_certificate_number?: string | null
          sat_stamp?: string | null
          serie?: string | null
          size?: number | null
          stamp_date?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          uuid?: string | null
          version?: string | null
          xml_content?: string | null
          year_period?: number | null
        }
        Update: {
          certificate_number?: string | null
          cfdi_stamp?: string | null
          complement_type?: string | null
          content_type?: string | null
          created_at?: string | null
          currency?: string | null
          exchange_rate?: number | null
          file_path?: string
          filename?: string
          global_periodic_number?: string | null
          id?: number
          invoice_date?: string | null
          invoice_effect?: string | null
          invoice_number?: string | null
          invoice_type?: string | null
          issuer_name?: string | null
          issuer_rfc?: string | null
          issuer_tax_regime?: string | null
          month_period?: number | null
          paid_amount?: number | null
          payment_form?: string | null
          payment_method?: string | null
          processed?: boolean | null
          receiver_cfdi_use?: string | null
          receiver_name?: string | null
          receiver_rfc?: string | null
          receiver_tax_regime?: string | null
          receiver_zip_code?: string | null
          sat_certificate_number?: string | null
          sat_stamp?: string | null
          serie?: string | null
          size?: number | null
          stamp_date?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          uuid?: string | null
          version?: string | null
          xml_content?: string | null
          year_period?: number | null
        }
        Relationships: []
      }
      Invoices: {
        Row: {
          certificate_number: string | null
          cfdi_stamp: string | null
          content_type: string | null
          created_at: string | null
          currency: string | null
          exchange_rate: number | null
          file_path: string
          filename: string
          id: number
          invoice_date: string | null
          invoice_number: string | null
          issuer_name: string | null
          issuer_rfc: string | null
          issuer_tax_regime: string | null
          payment_form: string | null
          payment_method: string | null
          processed: boolean | null
          receiver_cfdi_use: string | null
          receiver_name: string | null
          receiver_rfc: string | null
          receiver_tax_regime: string | null
          receiver_zip_code: string | null
          sat_certificate_number: string | null
          sat_stamp: string | null
          serie: string | null
          size: number | null
          stamp_date: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          uuid: string | null
          xml_content: string | null
        }
        Insert: {
          certificate_number?: string | null
          cfdi_stamp?: string | null
          content_type?: string | null
          created_at?: string | null
          currency?: string | null
          exchange_rate?: number | null
          file_path: string
          filename: string
          id?: number
          invoice_date?: string | null
          invoice_number?: string | null
          issuer_name?: string | null
          issuer_rfc?: string | null
          issuer_tax_regime?: string | null
          payment_form?: string | null
          payment_method?: string | null
          processed?: boolean | null
          receiver_cfdi_use?: string | null
          receiver_name?: string | null
          receiver_rfc?: string | null
          receiver_tax_regime?: string | null
          receiver_zip_code?: string | null
          sat_certificate_number?: string | null
          sat_stamp?: string | null
          serie?: string | null
          size?: number | null
          stamp_date?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          uuid?: string | null
          xml_content?: string | null
        }
        Update: {
          certificate_number?: string | null
          cfdi_stamp?: string | null
          content_type?: string | null
          created_at?: string | null
          currency?: string | null
          exchange_rate?: number | null
          file_path?: string
          filename?: string
          id?: number
          invoice_date?: string | null
          invoice_number?: string | null
          issuer_name?: string | null
          issuer_rfc?: string | null
          issuer_tax_regime?: string | null
          payment_form?: string | null
          payment_method?: string | null
          processed?: boolean | null
          receiver_cfdi_use?: string | null
          receiver_name?: string | null
          receiver_rfc?: string | null
          receiver_tax_regime?: string | null
          receiver_zip_code?: string | null
          sat_certificate_number?: string | null
          sat_stamp?: string | null
          serie?: string | null
          size?: number | null
          stamp_date?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          uuid?: string | null
          xml_content?: string | null
        }
        Relationships: []
      }
      issuer_pdf_configs: {
        Row: {
          additional_info: Json | null
          address: string | null
          created_at: string
          email: string | null
          id: string
          issuer_name: string | null
          issuer_rfc: string
          logo_url: string | null
          phone: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          additional_info?: Json | null
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          issuer_name?: string | null
          issuer_rfc: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          additional_info?: Json | null
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          issuer_name?: string | null
          issuer_rfc?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      manual_invoice_files: {
        Row: {
          content_type: string
          created_at: string | null
          file_path: string
          filename: string
          id: string
          size: number
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string | null
          file_path: string
          filename: string
          id?: string
          size: number
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          file_path?: string
          filename?: string
          id?: string
          size?: number
          user_id?: string
        }
        Relationships: []
      }
      manual_reconciliations: {
        Row: {
          chart_account_id: string | null
          created_at: string | null
          expense_id: string
          file_id: string | null
          id: string
          notes: string
          reconciliation_type: string
          reference_number: string | null
          user_id: string
        }
        Insert: {
          chart_account_id?: string | null
          created_at?: string | null
          expense_id: string
          file_id?: string | null
          id?: string
          notes: string
          reconciliation_type: string
          reference_number?: string | null
          user_id: string
        }
        Update: {
          chart_account_id?: string | null
          created_at?: string | null
          expense_id?: string
          file_id?: string | null
          id?: string
          notes?: string
          reconciliation_type?: string
          reference_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_reconciliations_chart_account_id_fkey"
            columns: ["chart_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_reconciliations_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_reconciliations_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "manual_invoice_files"
            referencedColumns: ["id"]
          },
        ]
      }
      page_permissions: {
        Row: {
          can_access: boolean | null
          created_at: string | null
          id: string
          page_path: string
          user_id: string
        }
        Insert: {
          can_access?: boolean | null
          created_at?: string | null
          id?: string
          page_path: string
          user_id: string
        }
        Update: {
          can_access?: boolean | null
          created_at?: string | null
          id?: string
          page_path?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          account_id: number
          amount: number
          client_id: string | null
          created_at: string | null
          date: string
          id: string
          is_reconciled: boolean | null
          notes: string | null
          payment_method: string
          reconciled_amount: number | null
          reconciled_count: number | null
          reference_number: string | null
          sales_channel_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          account_id: number
          amount: number
          client_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          is_reconciled?: boolean | null
          notes?: string | null
          payment_method: string
          reconciled_amount?: number | null
          reconciled_count?: number | null
          reference_number?: string | null
          sales_channel_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          account_id?: number
          amount?: number
          client_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          is_reconciled?: boolean | null
          notes?: string | null
          payment_method?: string
          reconciled_amount?: number | null
          reconciled_count?: number | null
          reference_number?: string | null
          sales_channel_id?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_sales_channel_id_fkey"
            columns: ["sales_channel_id"]
            isOneToOne: false
            referencedRelation: "sales_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
        }
        Relationships: []
      }
      report_configurations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parameters: Json | null
          report_type: Database["public"]["Enums"]["report_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parameters?: Json | null
          report_type: Database["public"]["Enums"]["report_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parameters?: Json | null
          report_type?: Database["public"]["Enums"]["report_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      Sales: {
        Row: {
          category: string | null
          Channel: string | null
          city: string | null
          comission: number | null
          cost: number | null
          created_at: string
          date: string | null
          datePaid: string | null
          hour: string | null
          id: number
          idClient: number | null
          invoice: string | null
          invoiceDate: string | null
          orderNumber: string | null
          payment_method: string | null
          postalCode: string | null
          price: number | null
          productName: string | null
          Profit: number | null
          profitMargin: number | null
          Quantity: number | null
          reconciliation_id: string | null
          retention: number | null
          shipping: number | null
          sku: string | null
          state: string | null
          statusPaid: string | null
          supplierName: string | null
        }
        Insert: {
          category?: string | null
          Channel?: string | null
          city?: string | null
          comission?: number | null
          cost?: number | null
          created_at?: string
          date?: string | null
          datePaid?: string | null
          hour?: string | null
          id?: number
          idClient?: number | null
          invoice?: string | null
          invoiceDate?: string | null
          orderNumber?: string | null
          payment_method?: string | null
          postalCode?: string | null
          price?: number | null
          productName?: string | null
          Profit?: number | null
          profitMargin?: number | null
          Quantity?: number | null
          reconciliation_id?: string | null
          retention?: number | null
          shipping?: number | null
          sku?: string | null
          state?: string | null
          statusPaid?: string | null
          supplierName?: string | null
        }
        Update: {
          category?: string | null
          Channel?: string | null
          city?: string | null
          comission?: number | null
          cost?: number | null
          created_at?: string
          date?: string | null
          datePaid?: string | null
          hour?: string | null
          id?: number
          idClient?: number | null
          invoice?: string | null
          invoiceDate?: string | null
          orderNumber?: string | null
          payment_method?: string | null
          postalCode?: string | null
          price?: number | null
          productName?: string | null
          Profit?: number | null
          profitMargin?: number | null
          Quantity?: number | null
          reconciliation_id?: string | null
          retention?: number | null
          shipping?: number | null
          sku?: string | null
          state?: string | null
          statusPaid?: string | null
          supplierName?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Sales_reconciliation_id_fkey"
            columns: ["reconciliation_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_channels: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      sat_automation_jobs: {
        Row: {
          captcha_required: boolean | null
          created_at: string | null
          downloaded_files: number | null
          end_date: string
          error_message: string | null
          id: string
          rfc: string
          start_date: string
          status: string
          total_files: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          captcha_required?: boolean | null
          created_at?: string | null
          downloaded_files?: number | null
          end_date: string
          error_message?: string | null
          id?: string
          rfc: string
          start_date: string
          status?: string
          total_files?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          captcha_required?: boolean | null
          created_at?: string | null
          downloaded_files?: number | null
          end_date?: string
          error_message?: string | null
          id?: string
          rfc?: string
          start_date?: string
          status?: string
          total_files?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sat_captcha_sessions: {
        Row: {
          captcha_image: string | null
          captcha_solution: string | null
          created_at: string | null
          id: string
          job_id: string
          resolved: boolean | null
          updated_at: string | null
        }
        Insert: {
          captcha_image?: string | null
          captcha_solution?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          resolved?: boolean | null
          updated_at?: string | null
        }
        Update: {
          captcha_image?: string | null
          captcha_solution?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          resolved?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sat_captcha_sessions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "sat_automation_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      sat_report_configurations: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          normal_complement: string
          period_month: number
          period_year: number
          report_type: string
          status: string | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          normal_complement?: string
          period_month: number
          period_year: number
          report_type: string
          status?: string | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          normal_complement?: string
          period_month?: number
          period_year?: number
          report_type?: string
          status?: string | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tax_rates: {
        Row: {
          created_at: string | null
          id: string
          is_retention: boolean | null
          name: string
          rate: number
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_retention?: boolean | null
          name: string
          rate: number
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_retention?: boolean | null
          name?: string
          rate?: number
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tax_regimes: {
        Row: {
          created_at: string | null
          description: string
          id: string
          key: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          key: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          key?: string
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invitation_token: string | null
          invited_by: string
          status: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string | null
          invited_by: string
          status?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string | null
          invited_by?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          can_access: boolean
          created_at: string
          id: string
          permission_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_access?: boolean
          created_at?: string
          id?: string
          permission_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_access?: boolean
          created_at?: string
          id?: string
          permission_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_company: {
        Args: { user_id: string; company_id: string }
        Returns: boolean
      }
      can_access_company_user: {
        Args: { user_id: string; company_id: string }
        Returns: boolean
      }
      create_annual_period: {
        Args: { user_uuid: string; year_param: number }
        Returns: undefined
      }
      create_daily_periods_for_month: {
        Args: { user_uuid: string; year_param: number; month_param: number }
        Returns: undefined
      }
      create_monthly_periods_for_year: {
        Args: { user_uuid: string; year_param: number }
        Returns: undefined
      }
      create_quarterly_periods_for_year: {
        Args: { user_uuid: string; year_param: number }
        Returns: undefined
      }
      find_invitation_by_token: {
        Args: { token_param: string }
        Returns: {
          company_id: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invitation_token: string | null
          invited_by: string
          status: string | null
        }[]
      }
      get_channel_distribution: {
        Args: { p_user_id?: string; p_start_date?: string; p_end_date?: string }
        Returns: {
          channel: string
          unique_orders: number
          total_revenue: number
          total_records: number
        }[]
      }
      get_channel_income_by_period: {
        Args: { p_user_id: string; p_period_id: string }
        Returns: {
          channel: string
          total: number
        }[]
      }
      get_dashboard_metrics: {
        Args: { p_user_id?: string; p_start_date?: string; p_end_date?: string }
        Returns: {
          total_revenue: number
          total_orders: number
          total_profit: number
          aov: number
          margin_percentage: number
          total_records: number
        }[]
      }
      get_sales_chart_data: {
        Args: { p_user_id?: string; p_start_date?: string; p_end_date?: string }
        Returns: {
          sale_date: string
          daily_revenue: number
          daily_orders: number
        }[]
      }
      get_state_distribution: {
        Args: { p_user_id?: string; p_start_date?: string; p_end_date?: string }
        Returns: {
          state: string
          total_revenue: number
          total_records: number
        }[]
      }
      has_company_permission: {
        Args: { user_id: string; permission_type: string }
        Returns: boolean
      }
      has_page_access: {
        Args: { user_id: string; page: string }
        Returns: boolean
      }
      has_permission: {
        Args: { user_id: string; permission_name: string }
        Returns: boolean
      }
      initialize_base_accounts: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      initialize_user_permissions: {
        Args: { target_user_id: string; role_name?: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      list_triggers_for_reconciliation: {
        Args: Record<PropertyKey, never>
        Returns: {
          trigger_name: string
          event_manipulation: string
          event_object_schema: string
          event_object_table: string
          action_statement: string
        }[]
      }
      list_triggers_for_table: {
        Args: { table_name: string }
        Returns: {
          trigger_name: string
          event_manipulation: string
          event_object_schema: string
          event_object_table: string
          action_statement: string
        }[]
      }
      mark_expired_invitations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      migrate_page_permissions_to_roles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_existing_invoices: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      report_type: "income_statement" | "cash_flow" | "balance_sheet"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      report_type: ["income_statement", "cash_flow", "balance_sheet"],
    },
  },
} as const
