
export interface SalesBase {
  id?: number
  category: string | null
  channel: string | null // Changed from Channel to channel
  city: string | null
  comission: number | null
  cost: number | null
  date: string | null
  datepaid: string | null // Changed from datePaid to datepaid
  hour: string | null
  idclient: number | null // Changed from idClient to idclient
  invoice: string | null
  invoicedate: string | null // Changed from invoiceDate to invoicedate
  ordernumber: string | null // Changed from orderNumber to ordernumber
  postalcode: string | null // Changed from postalCode to postalcode
  price: number | null
  productname: string | null // Changed from productName to productname
  profit: number | null // Changed from Profit to profit
  profitmargin: number | null // Changed from profitMargin to profitmargin
  quantity: number | null // Changed from Quantity to quantity
  retention: number | null
  shipping: number | null
  sku: string | null
  state: string | null
  statuspaid: string | null // Changed from statusPaid to statuspaid
  suppliername: string | null // Changed from supplierName to suppliername
  created_at?: string
}

export interface SalesTable {
  Row: SalesBase & { id: number, created_at: string }
  Insert: Partial<SalesBase & { id?: number, created_at?: string }>
  Update: Partial<SalesBase & { id?: number, created_at?: string }>
  Relationships: []
}
