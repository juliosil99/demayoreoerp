
export interface Company {
  id: string;
  user_id: string;
  name: string;
  industry?: string;
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  annual_revenue?: number;
  website?: string;
  description?: string;
  logo_url?: string;
  headquarters_location?: string;
  founded_year?: number;
  employee_count?: number;
  status: 'active' | 'inactive' | 'prospect' | 'customer' | 'churned';
  engagement_score: number;
  last_interaction_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  company_id?: string;
  name: string;
  rfc: string;
  phone?: string;
  type: string;
  job_title?: string;
  department?: string;
  is_primary_contact: boolean;
  engagement_score: number;
  last_interaction_date?: string;
  linkedin_url?: string;
  notes?: string;
  lead_source?: string;
  contact_status: 'active' | 'inactive' | 'qualified' | 'unqualified';
  default_chart_account_id?: string;
  tax_regime: string;
  address?: string;
  postal_code: string;
  created_at: string;
  company?: Company;
}

export interface Interaction {
  id: string;
  user_id: string;
  company_id?: string;
  contact_id?: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'task' | 'sale' | 'invoice' | 'payment' | 'mercadolibre_question';
  subject?: string;
  description?: string;
  interaction_date: string;
  outcome?: string;
  next_follow_up?: string;
  metadata: Record<string, any>;
  created_at: string;
  company?: Company;
  contact?: Contact;
}

// Raw Supabase interaction data type (what comes from the database)
export interface RawInteractionData {
  id: string;
  user_id: string;
  company_id?: string;
  contact_id?: string;
  type: string; // Generic string from DB
  subject?: string;
  description?: string;
  interaction_date: string;
  outcome?: string;
  next_follow_up?: string;
  metadata: any; // Json type from Supabase
  created_at: string;
  companies_crm?: {
    id: string;
    name: string;
    user_id: string;
  } | null;
  contacts?: {
    id: string;
    name: string;
    user_id: string;
  } | null;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  type: 'custom' | 'system';
  created_at: string;
}

export interface CompanyWithTags extends Company {
  tags: Tag[];
  contacts: Contact[];
  interactions: Interaction[];
}

export interface ContactWithTags extends Contact {
  tags: Tag[];
  interactions: Interaction[];
}

// Form types for components
export interface CompanyFormData {
  name: string;
  industry: string;
  company_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | '';
  website: string;
  description: string;
  headquarters_location: string;
  founded_year: string | number;
  employee_count: string | number;
  annual_revenue: string | number;
  status: 'active' | 'inactive' | 'prospect' | 'customer' | 'churned';
}

export interface InteractionFormData {
  type: 'email' | 'call' | 'meeting' | 'note' | 'task';
  subject: string;
  description: string;
  outcome: string;
  next_follow_up: string;
  interaction_date: string;
}
