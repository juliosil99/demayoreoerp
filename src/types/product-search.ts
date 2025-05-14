
export interface ProductSearchResult {
  id: number;
  invoice_id: number | null;
  description: string | null;
  quantity: number | null;
  unit_value: number | null;
  amount: number | null;
  unit: string | null;
  product_key: string | null;
  invoice?: {
    id: number;
    invoice_number: string | null;
    serie: string | null;
    invoice_date: string | null;
    issuer_name: string | null;
    issuer_rfc: string | null;
    file_path: string;
    receiver_name: string | null;
    receiver_rfc: string | null;
  };
}
