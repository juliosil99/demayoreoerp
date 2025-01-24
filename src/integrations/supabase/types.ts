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
      bank_accounts: {
        Row: {
          balance: number | null
          created_at: string | null
          id: number
          name: string
          type: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: number
          name: string
          type: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: number
          name?: string
          type?: string
        }
        Relationships: []
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
          content_type: string | null
          created_at: string | null
          currency: string | null
          exchange_rate: number | null
          file_path: string
          filename: string
          id: number
          invoice_date: string | null
          invoice_number: string | null
          invoice_type: string | null
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
          version: string | null
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
          invoice_type?: string | null
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
          version?: string | null
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
          invoice_type?: string | null
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
          version?: string | null
          xml_content?: string | null
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
          retention?: number | null
          shipping?: number | null
          sku?: string | null
          state?: string | null
          statusPaid?: string | null
          supplierName?: string | null
        }
        Relationships: []
      }
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
