
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
  paymentType?: string | null  // Making this optional with the ? symbol
  company_id: string  // New required field for company-based access control
  user_id?: string  // Keeping user_id field
  created_at?: string
}

export interface SalesTable {
  Row: SalesBase & { id: number, created_at: string }
  Insert: Partial<SalesBase> & { company_id: string } & { id?: number, created_at?: string }
  Update: Partial<SalesBase & { id?: number, created_at?: string }>
  Relationships: []
}
