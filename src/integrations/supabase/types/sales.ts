
export interface SalesBase {
  id?: number
  category: string | null
  Channel: string | null  // Keeping uppercase 'C' to match database
  city: string | null
  comission: number | null
  cost: number | null
  date: string | null
  datePaid: string | null  // Keeping camelCase to match database
  hour: string | null
  idClient: number | null  // Keeping camelCase to match database
  invoice: string | null
  invoiceDate: string | null  // Keeping camelCase to match database
  orderNumber: string | null  // Keeping camelCase to match database
  postalCode: string | null  // Keeping camelCase to match database
  price: number | null
  productName: string | null  // Keeping camelCase to match database
  Profit: number | null  // Keeping uppercase 'P' to match database
  profitMargin: number | null  // Keeping camelCase to match database
  Quantity: number | null  // Keeping uppercase 'Q' to match database
  retention: number | null
  shipping: number | null
  sku: string | null
  state: string | null
  statusPaid: string | null  // Keeping camelCase to match database
  supplierName: string | null  // Keeping camelCase to match database
  paymentType: string | null  // New field for payment type
  created_at?: string
}

export interface SalesTable {
  Row: SalesBase & { id: number, created_at: string }
  Insert: Partial<SalesBase & { id?: number, created_at?: string }>
  Update: Partial<SalesBase & { id?: number, created_at?: string }>
  Relationships: []
}
