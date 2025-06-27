
import type { Database } from "@/integrations/supabase/types";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

export interface InvoiceFilters {
  search: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  invoiceType: string;
  minAmount: string;
  maxAmount: string;
  reconciliationStatus: string;
  issuerName: string;
  receiverName: string;
}

export interface UseOptimizedInvoicesOptions {
  page: number;
  itemsPerPage: number;
  filters: InvoiceFilters;
}

export interface OptimizedInvoicesResult {
  invoices: (Partial<Invoice> & { 
    is_reconciled?: boolean;
    reconciliation_type?: 'automatic' | 'manual' | null;
  })[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
}

export type TransformedInvoice = Partial<Invoice> & { 
  is_reconciled?: boolean;
  reconciliation_type?: 'automatic' | 'manual' | null;
};
