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
      account_transfers: {
        Row: {
          amount: number
          created_at: string | null
          date: string
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
          created_at?: string | null
          date: string
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
          created_at?: string | null
          date?: string
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
          client_id: string | null
          created_at: string | null
          due_date: string
          expense_id: string | null
          id: string
          invoice_id: number | null
          notes: string | null
          payment_id: string | null
          payment_term: number
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          due_date: string
          expense_id?: string | null
          id?: string
          invoice_id?: number | null
          notes?: string | null
          payment_id?: string | null
          payment_term?: number
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          due_date?: string
          expense_id?: string | null
          id?: string
          invoice_id?: number | null
          notes?: string | null
          payment_id?: string | null
          payment_term?: number
          status?: string | null
          user_id?: string
        }
        Relationships: [
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
      accounts_receivable: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          description: string
          id: string
          invoice_id: number
          sale_id: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          invoice_id: number
          sale_id?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: number
          sale_id?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_expenses_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_client_id_fkey1"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "Sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoice"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          balance: number | null
          balance_date: string | null
          created_at: string | null
          id: number
          initial_balance: number | null
          name: string
          type: string
        }
        Insert: {
          balance?: number | null
          balance_date?: string | null
          created_at?: string | null
          id?: number
          initial_balance?: number | null
          name: string
          type: string
        }
        Update: {
          balance?: number | null
          balance_date?: string | null
          created_at?: string | null
          id?: number
          initial_balance?: number | null
          name?: string
          type?: string
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
      contacts: {
        Row: {
          address: string | null
          created_at: string | null
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
          id?: string
          name?: string
          phone?: string | null
          postal_code?: string
          rfc?: string
          tax_regime?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
          expense_id: string
          id: string
          invoice_id: number
          paid_amount: number | null
          reconciled_amount: number | null
          tax_details: Json | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          expense_id: string
          id?: string
          invoice_id: number
          paid_amount?: number | null
          reconciled_amount?: number | null
          tax_details?: Json | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          expense_id?: string
          id?: string
          invoice_id?: number
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
          date: string
          description: string
          id: string
          notes: string | null
          payment_method: string
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
          date: string
          description: string
          id?: string
          notes?: string | null
          payment_method: string
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
          date?: string
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string
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
          notes: string | null
          payment_method: string
          reference_number: string | null
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
          notes?: string | null
          payment_method: string
          reference_number?: string | null
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
          notes?: string | null
          payment_method?: string
          reference_number?: string | null
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
          created_at: string | null
          email: string
          id: string
          invitation_token: string | null
          invited_by: string
          role: Database["public"]["Enums"]["app_role"] | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          invitation_token?: string | null
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"] | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          invitation_token?: string | null
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_invitation_by_token: {
        Args: {
          token_param: string
        }
        Returns: {
          created_at: string | null
          email: string
          id: string
          invitation_token: string | null
          invited_by: string
          role: Database["public"]["Enums"]["app_role"] | null
          status: string | null
        }[]
      }
      has_page_access: {
        Args: {
          user_id: string
          page: string
        }
        Returns: boolean
      }
      initialize_base_accounts: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      process_existing_invoices: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      report_type: "income_statement" | "cash_flow" | "balance_sheet"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
