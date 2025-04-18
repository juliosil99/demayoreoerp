
export interface SalesBase {
  category: string | null
  Channel: string | null
  city: string | null
  comission: number | null
  cost: number | null
  date: string | null
  datePaid: string | null
  hour: string | null
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
  statusPaid: 'pending' | 'paid' | null
  supplierName: string | null
}

export interface SalesTable {
  Row: SalesBase & { id: number, created_at: string }
  Insert: Partial<SalesBase & { id?: number, created_at?: string }>
  Update: Partial<SalesBase & { id?: number, created_at?: string }>
  Relationships: []
}
