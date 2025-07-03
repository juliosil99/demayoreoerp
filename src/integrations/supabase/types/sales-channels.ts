
export interface SalesChannelsTable {
  Row: {
    id: string
    name: string
    code: string
    is_active: boolean
    user_id: string
    created_at: string
    type_channel: string
  }
  Insert: {
    id?: string
    name: string
    code: string
    is_active?: boolean
    user_id: string
    created_at?: string
    type_channel: string
  }
  Update: {
    id?: string
    name?: string
    code?: string
    is_active?: boolean
    user_id?: string
    created_at?: string
    type_channel?: string
  }
  Relationships: []
}
