
/**
 * Utility functions for handling currency in reconciliation
 */

/**
 * Gets the correct amount to use for reconciliation based on expense currency
 */
export const getReconciliationAmount = (expense: any): number => {
  if (!expense) return 0;
  
  // For USD expenses, use the original amount
  // For MXN expenses, use the regular amount
  const currency = expense.currency || 'MXN';
  return currency === 'USD' ? (expense.original_amount || expense.amount) : expense.amount;
};

/**
 * Gets display information for reconciliation amounts
 */
export const getReconciliationDisplayInfo = (expense: any) => {
  if (!expense) return { amount: 0, currency: 'MXN', displayText: '$0.00 MXN' };
  
  const currency = expense.currency || 'MXN';
  const amount = getReconciliationAmount(expense);
  
  return {
    amount,
    currency,
    displayText: `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
  };
};
