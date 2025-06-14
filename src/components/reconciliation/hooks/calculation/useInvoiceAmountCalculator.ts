
import { useMemo } from "react";
import { useCurrencyCalculator } from "./useCurrencyCalculator";

export const useInvoiceAmountCalculator = () => {
  const { calculateRemainingWithCurrency } = useCurrencyCalculator();

  /**
   * Calculates the total amount from a list of invoices,
   * accounting for credit notes (type E) and currency conversions
   */
  const calculateTotalAmount = (invoices: any[], expense?: any): number => {
    if (!invoices.length) return 0;
    
    if (expense) {
      const { totalSelectedAmount } = calculateRemainingWithCurrency(expense, invoices);
      return totalSelectedAmount;
    }
    
    // Fallback to simple calculation if no expense context
    return invoices.reduce((sum, inv) => {
      const amountToAdd = inv.invoice_type === 'E' ? -inv.total_amount : inv.total_amount;
      return sum + (amountToAdd || 0);
    }, 0);
  };

  /**
   * Calculates the remaining amount after selecting invoices with currency conversion
   */
  const calculateRemainingAmount = (expenseAmount: number, invoices: any[], expense?: any): number => {
    if (!invoices.length) return expenseAmount;
    
    if (expense) {
      const { remainingAmount } = calculateRemainingWithCurrency(expense, invoices);
      return remainingAmount;
    }
    
    // Fallback to simple calculation
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
