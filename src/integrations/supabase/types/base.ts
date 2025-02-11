
import type { InvoiceProductsTable } from './invoice-products'
import type { InvoicesTable } from './invoice'
import type { SalesTable } from './sales'
import type { BankAccountsTable } from './bank-accounts'
import type { ExpensesTable } from './expenses'

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
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invoice_products: InvoiceProductsTable
      invoices: InvoicesTable
      Sales: SalesTable
      bank_accounts: BankAccountsTable
      expenses: ExpensesTable
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type PublicSchema = Database[Extract<keyof Database, "public">]

