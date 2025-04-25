
export interface SalesBase {
  id?: number
  category: string | null
  channel: string | null  // Changed from Channel
  city: string | null
  comission: number | null
  cost: number | null
  date: string | null
  datepaid: string | null  // Changed from datePaid
  hour: string | null
  idclient: number | null  // Changed from idClient
  invoice: string | null
  invoicedate: string | null  // Changed from invoiceDate
  ordernumber: string | null  // Changed from orderNumber
  postalcode: string | null  // Changed from postalCode
  price: number | null
  productname: string | null  // Changed from productName
  profit: number | null  // Changed from Profit
  profitmargin: number | null  // Changed from profitMargin
  quantity: number | null  // Changed from Quantity
  retention: number | null
  shipping: number | null
  sku: string | null
  state: string | null
  statuspaid: string | null  // Changed from statusPaid
  suppliername: string | null  // Changed from supplierName
  created_at?: string
}

export interface SalesTable {
  Row: SalesBase & { id: number, created_at: string }
  Insert: Partial<SalesBase & { id?: number, created_at?: string }>
  Update: Partial<SalesBase & { id?: number, created_at?: string }>
  Relationships: []
}
