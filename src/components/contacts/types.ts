
export interface Contact {
  id: string;
  name: string;
  rfc: string;
  phone?: string;
  type: "client" | "supplier" | "employee";
  tax_regime: string;
  postal_code: string;
  address?: string;
  user_id: string;
  default_chart_account_id?: string;
}

export interface ContactFormValues {
  name: string;
  rfc: string;
  phone?: string;
  type: "client" | "supplier" | "employee";
  tax_regime: string;
  postal_code: string;
  address?: string;
  default_chart_account_id?: string;
}
