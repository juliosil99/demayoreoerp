/**
 * Process report data from balances, expenses, and payment adjustments
 */
export function processReportData(
  balances: any[], 
  expenses: any[], 
  targetCurrency: string,
  paymentAdjustments?: any[],
  sales?: any[]
): Record<string, number> {
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

  // Process aggregated expenses data
  if (expenses) {
    expenses.forEach(expense => {
      const accountType = expense.account_type;
      const accountKey = `${expense.account_code}-${expense.account_name}`;
      const amount = Number(expense.total_amount) || 0;
      
      // Add to account type total
      if (!processedData[accountType]) {
        processedData[accountType] = 0;
      }
      processedData[accountType] += amount;
      
      // Add to individual account
      processedData[accountKey] = amount;
    });
  }

  // Process aggregated payment adjustments data
  if (paymentAdjustments) {
    paymentAdjustments.forEach(adjustment => {
      const accountName = mapAdjustmentTypeToAccount(adjustment.adjustment_type);
      const accountType = 'expense'; // All adjustments are expense type
      const accountKey = `ADJ-${accountName}`;
      const amount = Number(adjustment.total_amount) || 0;
      
      // Add to expense type total
      if (!processedData[accountType]) {
        processedData[accountType] = 0;
      }
      processedData[accountType] += amount;
      
      // Add to individual account
      if (!processedData[accountKey]) {
        processedData[accountKey] = 0;
      }
      processedData[accountKey] += amount;
    });
  }

  // Process aggregated sales data
  if (sales && sales.length > 0) {
    const salesData = sales[0]; // Single aggregated record
    const totalRevenue = Number(salesData.total_revenue) || 0;
    const totalCostOfSales = Number(salesData.total_cost) || 0;
    const totalCommissions = Number(salesData.total_commission) || 0;
    const totalShipping = Number(salesData.total_shipping) || 0;

    // Add to processed data
    processedData['income'] = (processedData['income'] || 0) + totalRevenue;
    processedData['revenue'] = totalRevenue;
    processedData['cost_of_sales'] = totalCostOfSales;
    processedData['commission_expenses'] = totalCommissions;
    processedData['shipping_expenses'] = totalShipping;

    // Add individual sales categories
    processedData['501-Ventas'] = totalRevenue;
    processedData['601-Costo de Ventas'] = totalCostOfSales;
    processedData['602-Gastos de Comisión'] = totalCommissions;
    processedData['603-Gastos de Envío'] = totalShipping;
  }

  return processedData;
}

/**
 * Map adjustment types to expense account names
 */
export function mapAdjustmentTypeToAccount(adjustmentType: string): string {
  const typeMapping: Record<string, string> = {
    'commission': 'Gastos de Comisión',
    'shipping': 'Gastos de Envío',
    'fee': 'Gastos de Comisión',
    'handling': 'Gastos de Manejo',
    'tax': 'Gastos Fiscales',
    'discount': 'Descuentos Aplicados'
  };
  
  return typeMapping[adjustmentType] || 'Gastos Diversos';
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
