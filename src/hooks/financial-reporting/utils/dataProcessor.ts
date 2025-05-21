/**
 * Process report data from balances and expenses
 */
export function processReportData(balances: any[], expenses: any[], targetCurrency: string): Record<string, number> {
  const processedData: Record<string, number> = {};
  
  // Process account balances
  if (balances) {
    balances.forEach(balance => {
      const accountType = balance.chart_of_accounts.account_type;
      
      if (!processedData[accountType]) {
        processedData[accountType] = 0;
      }
      
      processedData[accountType] += Number(balance.balance);
      
      // Store individual account
      const accountKey = `${balance.chart_of_accounts.code}-${balance.chart_of_accounts.name}`;
      processedData[accountKey] = Number(balance.balance);
    });
  }

  // Process expenses with currency handling
  if (expenses) {
    expenses.forEach(expense => {
      if (expense.chart_of_accounts) {
        const accountType = expense.chart_of_accounts.account_type;
        const accountKey = `${expense.chart_of_accounts.code}-${expense.chart_of_accounts.name}`;
        
        // Calculate amount in target currency, preserving sign for refunds
        const amountInReportCurrency = convertCurrency(
          expense.amount,
          expense.original_amount,
          expense.currency,
          targetCurrency,
          expense.exchange_rate
        );
        
        // Add to account type total, respecting the sign
        if (!processedData[accountType]) {
          processedData[accountType] = 0;
        }
        processedData[accountType] += amountInReportCurrency;
        
        // Add to individual account
        if (!processedData[accountKey]) {
          processedData[accountKey] = 0;
        }
        processedData[accountKey] += amountInReportCurrency;
      }
    });
  }

  return processedData;
}

/**
 * Convert currency amount, preserving sign for refunds
 */
export function convertCurrency(
  amountInMXN: number, 
  originalAmount: number, 
  sourceCurrency: string, 
  targetCurrency: string,
  exchangeRate: number
): number {
  // If already in target currency, use original amount (with sign preservation)
  if (sourceCurrency === targetCurrency) {
    return Number(originalAmount);
  }
  
  // Otherwise use the stored MXN amount (already has the correct sign)
  let convertedAmount = Number(amountInMXN);
  
  // If converting from MXN to USD
  if (targetCurrency === 'USD' && sourceCurrency === 'MXN') {
    // Use the inverse of the exchange rate, preserving sign
    const absAmount = Math.abs(Number(amountInMXN));
    const convertedAbsAmount = absAmount / Number(exchangeRate || 1);
    convertedAmount = Number(amountInMXN) < 0 ? -convertedAbsAmount : convertedAbsAmount;
  }
  
  return convertedAmount;
}
