
import type { TransformedInvoice } from "../types/optimizedInvoiceTypes";

export const transformInvoices = (
  invoices: any[],
  reconciledInvoiceIds: number[]
): TransformedInvoice[] => {
  return invoices?.map((invoice: any) => {
    const hasExpenseRelation = reconciledInvoiceIds.includes(invoice.id);
    const isManuallyReconciled = invoice.manually_reconciled === true;
    const isProcessed = invoice.processed === true;
    const isReconciled = hasExpenseRelation || isManuallyReconciled || isProcessed;
    
    // Determine reconciliation type
    let reconciliationType: 'automatic' | 'manual' | null = null;
    if (hasExpenseRelation) {
      reconciliationType = 'automatic';
    } else if (isManuallyReconciled) {
      reconciliationType = 'manual';
    } else if (isProcessed) {
      reconciliationType = 'automatic'; // Processed invoices are automatically reconciled
    }
    
    return {
      ...invoice,
      is_reconciled: isReconciled,
      reconciliation_type: reconciliationType
    };
  }) || [];
};
