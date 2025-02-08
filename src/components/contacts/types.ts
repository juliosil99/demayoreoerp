
export interface Contact {
  id: string;
  name: string;
  rfc: string;
  phone?: string;
  type: "client" | "supplier";
  tax_regime: string;
  postal_code: string;
  address?: string;
  user_id: string;
}

export interface ContactFormValues {
  name: string;
  rfc: string;
  phone?: string;
  type: "client" | "supplier";
  tax_regime: string;
  postal_code: string;
  address?: string;
}
