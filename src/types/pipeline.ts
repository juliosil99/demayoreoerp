
export interface PipelineStage {
  id: string;
  name: string;
  order_index: number;
  color: string;
  is_closed: boolean;
  created_at: string;
}

export interface Opportunity {
  id: string;
  user_id: string;
  company_id?: string;
  contact_id?: string;
  title: string;
  description?: string;
  value: number;
  currency: string;
  stage_id: string;
  probability: number;
  expected_close_date?: string;
  actual_close_date?: string;
  source?: string;
  created_at: string;
  updated_at: string;
  // Relations
  stage?: PipelineStage;
  company?: any;
  contact?: any;
}

export interface OpportunityActivity {
  id: string;
  opportunity_id: string;
  user_id: string;
  activity_type: 'stage_change' | 'note' | 'task' | 'call' | 'email';
  description?: string;
  old_stage_id?: string;
  new_stage_id?: string;
  created_at: string;
  old_stage?: PipelineStage;
  new_stage?: PipelineStage;
}

export interface OpportunityFormData {
  title: string;
  description: string;
  value: string;
  currency: string;
  company_id: string;
  contact_id: string;
  stage_id: string;
  probability: number;
  expected_close_date: string;
  source: string;
}
