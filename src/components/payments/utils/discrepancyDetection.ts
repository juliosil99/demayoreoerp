
import { UnreconciledSale } from "../hooks/useBulkReconciliation";
import type { Payment } from "../PaymentForm";

export interface DiscrepancyResult {
  hasDiscrepancy: boolean;
  type: 'amount' | 'date' | 'none';
  difference?: number;
}

export function detectDiscrepancies(
  sales: UnreconciledSale[],
  payment?: Payment
): DiscrepancyResult {
  if (!payment || !sales.length) {
    return { hasDiscrepancy: false, type: 'none' };
  }

  // Calculate total amount from sales
  const salesTotal = sales.reduce((sum, sale) => sum + (sale.price || 0), 0);
  
  // Check for amount discrepancy
  const amountDifference = Math.abs(salesTotal - payment.amount);
  if (amountDifference > 0.01) { // Using 0.01 to account for floating point precision
    return {
      hasDiscrepancy: true,
      type: 'amount',
      difference: amountDifference
    };
  }

  return { hasDiscrepancy: false, type: 'none' };
}
