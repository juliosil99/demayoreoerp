
import type { TransformedInvoice } from "../types/optimizedInvoiceTypes";

export const transformInvoices = (
  invoices: any[],
  reconciledInvoiceIds: number[]
): TransformedInvoice[] => {
  return invoices?.map((invoice: any) => {
    const hasExpenseRelation = reconciledInvoiceIds.includes(invoice.id);
    const isManuallyReconciled = invoice.manually_reconciled === true;
    const isReconciled = hasExpenseRelation || isManuallyReconciled;
    
    return {
      ...invoice,
      is_reconciled: isReconciled,
      reconciliation_type: hasExpenseRelation ? 'automatic' : 
                          isManuallyReconciled ? 'manual' : null
    };
  }) || [];
};
