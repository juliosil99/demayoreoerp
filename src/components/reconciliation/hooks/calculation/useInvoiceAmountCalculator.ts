
import { useMemo } from "react";

export const useInvoiceAmountCalculator = () => {
  /**
   * Calculates the total amount from a list of invoices,
   * accounting for credit notes (type E)
   */
  const calculateTotalAmount = (invoices: any[]): number => {
    return invoices.reduce((sum, inv) => {
      // For credit notes (type E), subtract the amount instead of adding it
      const amountToAdd = inv.invoice_type === 'E' ? -inv.total_amount : inv.total_amount;
      return sum + (amountToAdd || 0);
    }, 0);
  };

  /**
   * Calculates the remaining amount after selecting invoices
   */
  const calculateRemainingAmount = (expenseAmount: number, invoices: any[]): number => {
    if (!invoices.length) return expenseAmount;
    
    const totalSelectedAmount = calculateTotalAmount(invoices);
    return expenseAmount - totalSelectedAmount;
  };

  /**
   * Determines the adjustment type based on the remaining amount
   */
  const determineAdjustmentType = (remainingAmount: number): "expense_excess" | "invoice_excess" => {
    return remainingAmount > 0 ? "expense_excess" : "invoice_excess";
  };

  return {
    calculateTotalAmount,
    calculateRemainingAmount,
    determineAdjustmentType
  };
};
