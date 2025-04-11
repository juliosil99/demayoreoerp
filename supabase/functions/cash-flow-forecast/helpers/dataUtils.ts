
/**
 * Helper function to summarize financial data
 */
export function summarizeFinancialData(data: any[]) {
  if (!Array.isArray(data) || data.length === 0) {
    return { count: 0, total: 0, average: 0 };
  }
  
  let total = 0;
  let count = data.length;
  
  // Sum up amounts, handling different property names
  data.forEach(item => {
    const amount = item.amount || item.price || item.total_amount || 0;
    total += Number(amount) || 0;
  });
  
  return {
    count,
    total,
    average: count > 0 ? total / count : 0,
    // Include the first 5 items for reference
    recentItems: data.slice(0, 5).map(item => ({
      date: item.date || item.due_date || item.created_at || 'unknown',
      amount: item.amount || item.price || item.total_amount || 0,
      description: item.description || item.notes || ''
    }))
  };
}

/**
 * Helper function to calculate average amount from financial data
 */
export function calculateAverageAmount(data: any[]) {
  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }
  
  let total = 0;
  let count = 0;
  
  data.forEach(item => {
    const amount = Number(item.amount || item.price || item.total_amount || 0);
    if (amount > 0) {
      total += amount;
      count++;
    }
  });
  
  return count > 0 ? total / count : 0;
}
