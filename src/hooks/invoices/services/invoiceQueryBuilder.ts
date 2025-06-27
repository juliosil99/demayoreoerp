
import { supabase } from "@/integrations/supabase/client";
import type { InvoiceFilters } from "../types/optimizedInvoiceTypes";

export const buildInvoiceQuery = (filters: InvoiceFilters, reconciledInvoiceIds: number[]) => {
  // Build the main query with ONLY the fields we need for the UI
  let query = supabase
    .from("invoices")
    .select(`
      id,
      filename,
      invoice_date,
      created_at,
      invoice_number,
      serie,
      invoice_type,
      issuer_name,
      issuer_rfc,
      receiver_name,
      receiver_rfc,
      total_amount,
      tax_amount,
      status,
      manually_reconciled,
      processed,
      file_path
    `, { count: 'exact' });

  // Apply search filter
  if (filters.search && filters.search.trim()) {
    const searchTerm = `%${filters.search.trim()}%`;
    query = query.or(`invoice_number.ilike.${searchTerm},issuer_name.ilike.${searchTerm},receiver_name.ilike.${searchTerm},uuid.ilike.${searchTerm}`);
  }

  // Apply issuer name filter
  if (filters.issuerName && filters.issuerName.trim()) {
    const issuerTerm = `%${filters.issuerName.trim()}%`;
    query = query.ilike('issuer_name', issuerTerm);
  }

  // Apply receiver name filter
  if (filters.receiverName && filters.receiverName.trim()) {
    const receiverTerm = `%${filters.receiverName.trim()}%`;
    query = query.ilike('receiver_name', receiverTerm);
  }

  // Apply date range filters
  if (filters.dateFrom) {
    const fromDate = filters.dateFrom.toISOString().split('T')[0];
    query = query.gte('invoice_date', fromDate);
  }

  if (filters.dateTo) {
    const toDate = filters.dateTo.toISOString().split('T')[0];
    query = query.lte('invoice_date', toDate);
  }

  // Apply invoice type filter
  if (filters.invoiceType && filters.invoiceType !== 'all') {
    query = query.eq('invoice_type', filters.invoiceType);
  }

  // Apply amount filters
  if (filters.minAmount && filters.minAmount.trim()) {
    const minAmount = parseFloat(filters.minAmount.trim());
    if (!isNaN(minAmount)) {
      query = query.gte('total_amount', minAmount);
    }
  }

  if (filters.maxAmount && filters.maxAmount.trim()) {
    const maxAmount = parseFloat(filters.maxAmount.trim());
    if (!isNaN(maxAmount)) {
      query = query.lte('total_amount', maxAmount);
    }
  }

  // Apply reconciliation status filter with enhanced logic
  if (filters.reconciliationStatus === 'reconciled') {
    // Show invoices that are either in expense_invoice_relations OR manually_reconciled = true OR processed = true
    if (reconciledInvoiceIds.length > 0) {
      query = query.or(`id.in.(${reconciledInvoiceIds.join(',')}),manually_reconciled.eq.true,processed.eq.true`);
    } else {
      query = query.or('manually_reconciled.eq.true,processed.eq.true');
    }
  } else if (filters.reconciliationStatus === 'unreconciled') {
    // Show invoices that are NOT in expense_invoice_relations AND manually_reconciled = false AND processed = false
    if (reconciledInvoiceIds.length > 0) {
      query = query.not('id', 'in', `(${reconciledInvoiceIds.join(',')})`);
    }
    query = query.eq('manually_reconciled', false).eq('processed', false);
  }

  return query;
};
