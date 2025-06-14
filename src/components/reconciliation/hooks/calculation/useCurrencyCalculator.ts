
import { useMemo } from "react";

export const useCurrencyCalculator = () => {
  /**
   * Converts an amount from one currency to another using the provided exchange rate
   */
  const convertCurrency = (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    exchangeRate: number = 1
  ): number => {
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    // If converting from USD to MXN, multiply by exchange rate
    if (fromCurrency === 'USD' && toCurrency === 'MXN') {
      return amount * exchangeRate;
    }
    
    // If converting from MXN to USD, divide by exchange rate
    if (fromCurrency === 'MXN' && toCurrency === 'USD') {
      return amount / exchangeRate;
    }
    
    return amount;
  };

  /**
   * Gets the appropriate amount for comparison based on currency matching
   */
  const getComparableAmount = (
    expense: any,
    invoice: any
  ): { expenseAmount: number; invoiceAmount: number; isConverted: boolean } => {
    const expenseCurrency = expense.currency || 'MXN';
    const invoiceCurrency = invoice.currency || 'MXN';
    
    // If currencies match, use original amounts
    if (expenseCurrency === invoiceCurrency) {
      return {
        expenseAmount: expense.original_amount || expense.amount,
        invoiceAmount: invoice.total_amount,
        isConverted: false
      };
    }
    
    // If currencies don't match, convert to MXN (base currency)
    const expenseInMXN = expenseCurrency === 'USD' 
      ? convertCurrency(expense.original_amount, 'USD', 'MXN', expense.exchange_rate)
      : expense.amount;
      
    const invoiceInMXN = invoiceCurrency === 'USD'
      ? convertCurrency(invoice.total_amount, 'USD', 'MXN', invoice.exchange_rate || 1)
      : invoice.total_amount;
    
    return {
      expenseAmount: expenseInMXN,
      invoiceAmount: invoiceInMXN,
      isConverted: true
    };
  };

  /**
   * Calculates the remaining amount considering currency conversions
   */
  const calculateRemainingWithCurrency = (
    expense: any,
    invoices: any[]
  ): { remainingAmount: number; totalSelectedAmount: number; isConverted: boolean } => {
    if (!invoices.length) {
      return {
        remainingAmount: expense.amount,
        totalSelectedAmount: 0,
        isConverted: false
      };
    }
    
    let totalSelectedAmount = 0;
    let hasConversions = false;
    
    // Calculate total selected amount in MXN (base currency)
    invoices.forEach(invoice => {
      const { invoiceAmount, isConverted } = getComparableAmount(expense, invoice);
      const amountToAdd = invoice.invoice_type === 'E' ? -invoiceAmount : invoiceAmount;
      totalSelectedAmount += amountToAdd;
      
      if (isConverted) {
        hasConversions = true;
      }
    });
    
    // Always work with MXN amounts for final calculation
    const expenseAmountInMXN = expense.currency === 'USD' 
      ? convertCurrency(expense.original_amount, 'USD', 'MXN', expense.exchange_rate)
      : expense.amount;
    
    return {
      remainingAmount: expenseAmountInMXN - totalSelectedAmount,
      totalSelectedAmount,
      isConverted: hasConversions
    };
  };

  /**
   * Gets display information for amounts with currency context
   */
  const getDisplayAmounts = (expense: any, invoice?: any) => {
    const expenseCurrency = expense.currency || 'MXN';
    
    let expenseDisplay = {
      original: {
        amount: expense.original_amount || expense.amount,
        currency: expenseCurrency === 'USD' ? 'USD' : 'MXN'
      },
      converted: null as { amount: number; currency: string } | null
    };
    
    // If expense is in USD, show both USD and MXN amounts
    if (expenseCurrency === 'USD') {
      expenseDisplay.converted = {
        amount: expense.amount, // This should be the MXN amount
        currency: 'MXN'
      };
    }
    
    if (invoice) {
      const invoiceCurrency = invoice.currency || 'MXN';
      let invoiceDisplay = {
        original: {
          amount: invoice.total_amount,
          currency: invoiceCurrency
        },
        converted: null as { amount: number; currency: string } | null
      };
      
      // If invoice is in USD, calculate MXN equivalent
      if (invoiceCurrency === 'USD') {
        invoiceDisplay.converted = {
          amount: convertCurrency(invoice.total_amount, 'USD', 'MXN', invoice.exchange_rate || 1),
          currency: 'MXN'
        };
      }
      
      return { expense: expenseDisplay, invoice: invoiceDisplay };
    }
    
    return { expense: expenseDisplay };
  };

  return {
    convertCurrency,
    getComparableAmount,
    calculateRemainingWithCurrency,
    getDisplayAmounts
  };
};
