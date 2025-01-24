export interface InvoiceBase {
  certificate_number: string | null;
  cfdi_stamp: string | null;
  content_type: string | null;
  created_at: string | null;
  currency: string | null;
  exchange_rate: number | null;
  file_path: string;
  filename: string;
  invoice_date: string | null;
  invoice_number: string | null;
  invoice_type: string | null;  // Added this field
  issuer_name: string | null;
  issuer_rfc: string | null;
  issuer_tax_regime: string | null;
  payment_form: string | null;
  payment_method: string | null;
  processed: boolean | null;
  receiver_cfdi_use: string | null;
  receiver_name: string | null;
  receiver_rfc: string | null;
  receiver_tax_regime: string | null;
  receiver_zip_code: string | null;
  sat_certificate_number: string | null;
  sat_stamp: string | null;
  serie: string | null;
  size: number | null;
  stamp_date: string | null;
  status: string | null;
  subtotal: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  uuid: string | null;
  version: string | null;
  xml_content: string | null;
}

export interface InvoicesTable {
  Row: InvoiceBase & { id: number };
  Insert: InvoiceBase & { id?: number };
  Update: Partial<InvoiceBase & { id?: number }>;
  Relationships: [];
}