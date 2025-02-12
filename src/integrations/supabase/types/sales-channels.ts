
export interface SalesChannelsTable {
  Row: {
    id: string
    name: string
    code: string
    is_active: boolean
    user_id: string
    created_at: string
  }
  Insert: {
    id?: string
    name: string
    code: string
    is_active?: boolean
    user_id: string
    created_at?: string
  }
  Update: {
    id?: string
    name?: string
    code?: string
    is_active?: boolean
    user_id?: string
    created_at?: string
  }
  Relationships: []
}
