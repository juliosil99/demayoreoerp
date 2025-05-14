
// Invoice XML parser types

export interface InvoiceProduct {
  description: string | null;
  quantity: number;
  unit: string | null;
  unitValue: number;
  amount: number;
  productKey: string | null;
  unitKey: string | null;
}

export interface CFDIParseResult {
  // Core invoice data
  uuid: string | null;
  serie: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  total_amount: number;
  currency: string | null;
  payment_method: string | null;
  payment_form: string | null;
  subtotal: number;
  exchange_rate: number;
  invoice_type: string | null;
  version: string | null;
  
  // Issuer information
  issuer_rfc: string | null;
  issuer_name: string | null;
  issuer_tax_regime: string | null;
  
  // Receiver information
  receiver_rfc: string | null;
  receiver_name: string | null;
  receiver_tax_regime: string | null;
  receiver_cfdi_use: string | null;
  receiver_zip_code: string | null;
  
  // Certificate information
  certificate_number: string | null;
  stamp_date: string | null;
  sat_certificate_number: string | null;
  cfdi_stamp: string | null;
  sat_stamp: string | null;
  
  // Tax information
  tax_amount: number;
  
  // Products
  products: InvoiceProduct[];
  
  // Error handling
  error?: boolean;
  errorMessage?: string;
}
