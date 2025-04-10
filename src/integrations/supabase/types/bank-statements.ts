
export interface BankStatementsTable {
  Row: {
    id: string
    user_id: string
    account_id: number
    filename: string
    file_path: string
    content_type: string
    size: number
    month: number
    year: number
    upload_date: string
    description: string | null
  }
  Insert: {
    id?: string
    user_id: string
    account_id: number
    filename: string
    file_path: string
    content_type: string
    size: number
    month: number
    year: number
    upload_date?: string
    description?: string | null
  }
  Update: {
    id?: string
    user_id?: string
    account_id?: number
    filename?: string
    file_path?: string
    content_type?: string
    size?: number
    month?: number
    year?: number
    upload_date?: string
    description?: string | null
  }
}
