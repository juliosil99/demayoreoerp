export interface InvoiceProductBase {
  amount: number | null
  created_at: string | null
  description: string | null
  invoice_id: number | null
  product_key: string | null
  quantity: number | null
  unit: string | null
  unit_key: string | null
  unit_value: number | null
}

export interface InvoiceProductsTable {
  Row: InvoiceProductBase & { id: number }
  Insert: InvoiceProductBase & { id?: number }
  Update: Partial<InvoiceProductBase & { id?: number }>
  Relationships: [
    {
      foreignKeyName: "invoice_products_invoice_id_fkey"
      columns: ["invoice_id"]
      isOneToOne: false
      referencedRelation: "invoices"
      referencedColumns: ["id"]
    }
  ]
}