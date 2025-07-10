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

  // Process payment adjustments as virtual expenses
  if (paymentAdjustments) {
    paymentAdjustments.forEach(adjustment => {
      const accountName = mapAdjustmentTypeToAccount(adjustment.adjustment_type);
      const accountType = 'expense'; // All adjustments are expense type
      const accountKey = `ADJ-${accountName}`;
      
      // Convert amount to target currency (adjustments are stored in MXN)
      const amountInReportCurrency = convertCurrency(
        adjustment.amount,
        adjustment.amount,
        'MXN', // Payment adjustments are always in MXN
        targetCurrency,
        1 // Exchange rate is 1 for MXN adjustments
      );
      
      // Add to expense type total
      if (!processedData[accountType]) {
        processedData[accountType] = 0;
      }
      processedData[accountType] += amountInReportCurrency;
      
      // Add to individual account
      if (!processedData[accountKey]) {
        processedData[accountKey] = 0;
      }
      processedData[accountKey] += amountInReportCurrency;
    });
  }

  // Process sales data
  if (sales) {
    console.log('📊 Processing sales data:', { salesCount: sales.length });
    
    let totalRevenue = 0;
    let totalCostOfSales = 0;
    let totalCommissions = 0;
    let totalShipping = 0;

    sales.forEach(sale => {
      const revenue = Number(sale.price) || 0;
      const cost = Number(sale.cost) || 0;
      const commission = Number(sale.comission) || 0;
      const shipping = Number(sale.shipping) || 0;

      totalRevenue += revenue;
      totalCostOfSales += cost;
      totalCommissions += commission;
      totalShipping += shipping;
    });

    console.log('📊 Sales totals calculated:', {
      totalRevenue,
      totalCostOfSales,
      totalCommissions,
      totalShipping
    });

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

    console.log('📊 Final processed data keys:', Object.keys(processedData));
    console.log('📊 Revenue in processed data:', processedData['revenue'], processedData['501-Ventas']);
  } else {
    console.log('❌ No sales data provided to process');
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
