
export interface IssuerPdfConfig {
  id: string;
  user_id: string;
  issuer_rfc: string;
  issuer_name: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  logo_url: string | null;
  additional_info?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}
