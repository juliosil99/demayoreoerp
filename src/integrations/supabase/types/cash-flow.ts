
export type CashFlowForecastsTable = {
  Row: {
    id: string
    user_id: string
    created_at: string
    start_date: string
    name: string
    description: string | null
    status: string
    config: Record<string, any> | null
    ai_insights: string | null
  }
  Insert: {
    id?: string
    user_id: string
    created_at?: string
    start_date: string
    name: string
    description?: string | null
    status?: string
    config?: Record<string, any> | null
    ai_insights?: string | null
  }
  Update: {
    id?: string
    user_id?: string
    created_at?: string
    start_date?: string
    name?: string
    description?: string | null
    status?: string
    config?: Record<string, any> | null
    ai_insights?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "cash_flow_forecasts_user_id_fkey"
      columns: ["user_id"]
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}

export type ForecastWeeksTable = {
  Row: {
    id: string
    forecast_id: string
    week_number: number
    week_start_date: string
    week_end_date: string
    predicted_inflows: number
    predicted_outflows: number
    actual_inflows: number | null
    actual_outflows: number | null
    notes: string | null
    confidence_score: number | null
  }
  Insert: {
    id?: string
    forecast_id: string
    week_number: number
    week_start_date: string
    week_end_date: string
    predicted_inflows?: number
    predicted_outflows?: number
    actual_inflows?: number | null
    actual_outflows?: number | null
    notes?: string | null
    confidence_score?: number | null
  }
  Update: {
    id?: string
    forecast_id?: string
    week_number?: number
    week_start_date?: string
    week_end_date?: string
    predicted_inflows?: number
    predicted_outflows?: number
    actual_inflows?: number | null
    actual_outflows?: number | null
    notes?: string | null
    confidence_score?: number | null
  }
  Relationships: [
    {
      foreignKeyName: "forecast_weeks_forecast_id_fkey"
      columns: ["forecast_id"]
      referencedRelation: "cash_flow_forecasts"
      referencedColumns: ["id"]
    }
  ]
}

export type ForecastItemsTable = {
  Row: {
    id: string
    forecast_id: string
    week_id: string
    category: string
    amount: number
    description: string | null
    is_recurring: boolean | null
    confidence_score: number | null
    type: string
    source: string
  }
  Insert: {
    id?: string
    forecast_id: string
    week_id: string
    category: string
    amount: number
    description?: string | null
    is_recurring?: boolean | null
    confidence_score?: number | null
    type: string
    source: string
  }
  Update: {
    id?: string
    forecast_id?: string
    week_id?: string
    category?: string
    amount?: number
    description?: string | null
    is_recurring?: boolean | null
    confidence_score?: number | null
    type?: string
    source?: string
  }
  Relationships: [
    {
      foreignKeyName: "forecast_items_forecast_id_fkey"
      columns: ["forecast_id"]
      referencedRelation: "cash_flow_forecasts"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "forecast_items_week_id_fkey"
      columns: ["week_id"]
      referencedRelation: "forecast_weeks"
      referencedColumns: ["id"]
    }
  ]
}
