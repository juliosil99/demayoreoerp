
interface ScheduledPayment {
  amount: number;
  dueDate: string;
  type: 'payable' | 'credit' | 'loan';
  description?: string;
}

// Calculate weekly scheduled payments
export function getScheduledPayments(
  payables: any[], 
  creditPayments: any[], 
  weekStart: Date,
  weekEnd: Date
): ScheduledPayment[] {
  const scheduledPayments: ScheduledPayment[] = [];
  
  // Add payables due this week
  payables?.forEach(payable => {
    const dueDate = new Date(payable.due_date);
    if (dueDate >= weekStart && dueDate <= weekEnd) {
      scheduledPayments.push({
        amount: payable.amount,
        dueDate: payable.due_date,
        type: 'payable',
        description: `Payment due to ${payable.client?.name || 'Unknown'}`
      });
    }
  });
  
  // Add credit/loan payments due this week
  creditPayments?.forEach(payment => {
    const dueDate = new Date(payment.dueDate);
    if (dueDate >= weekStart && dueDate <= weekEnd) {
      scheduledPayments.push({
        amount: payment.amount,
        dueDate: payment.dueDate,
        type: payment.type.includes('Credit') ? 'credit' : 'loan',
        description: `Payment for ${payment.accountName}`
      });
    }
  });
  
  return scheduledPayments;
}

// Analyze historical expenses for patterns
export function analyzeExpensePatterns(expenses: any[]) {
  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc: any, expense: any) => {
    const category = expense.category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(expense);
    return acc;
  }, {});
  
  // Calculate weekly averages and patterns by category
  const patterns: Record<string, any> = {};
  
  for (const [category, categoryExpenses] of Object.entries(expensesByCategory)) {
    const weeklyTotal = (categoryExpenses as any[]).reduce((sum, exp) => sum + exp.amount, 0) / 13; // Average over 13 weeks
    const hasRecurringPattern = detectRecurringPattern(categoryExpenses as any[]);
    
    patterns[category] = {
      weeklyAverage: weeklyTotal,
      isRecurring: hasRecurringPattern,
      confidence: calculateConfidence(categoryExpenses as any[])
    };
  }
  
  return patterns;
}

function detectRecurringPattern(expenses: any[]): boolean {
  if (expenses.length < 4) return false;
  
  // Sort expenses by date
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Check for regular intervals
  let hasPattern = false;
  let intervalSum = 0;
  let intervalCount = 0;
  
  for (let i = 1; i < sortedExpenses.length; i++) {
    const interval = Math.abs(
      new Date(sortedExpenses[i].date).getTime() - 
      new Date(sortedExpenses[i-1].date).getTime()
    ) / (1000 * 60 * 60 * 24); // Convert to days
    
    intervalSum += interval;
    intervalCount++;
  }
  
  const averageInterval = intervalSum / intervalCount;
  const variance = calculateVariance(sortedExpenses.map(e => e.amount));
  
  // If average interval is close to 7, 14, or 30 days and variance is low
  hasPattern = (
    [7, 14, 30].some(days => Math.abs(averageInterval - days) < 2) &&
    variance < 0.25
  );
  
  return hasPattern;
}

function calculateVariance(amounts: number[]): number {
  const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
  const squaredDiffs = amounts.map(val => Math.pow(val - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / amounts.length) / mean;
}

function calculateConfidence(expenses: any[]): number {
  // More data points = higher confidence
  const dataPointFactor = Math.min(expenses.length / 20, 1); // Max out at 20 data points
  
  // Regular patterns = higher confidence
  const hasPattern = detectRecurringPattern(expenses);
  const patternFactor = hasPattern ? 0.3 : 0;
  
  // Recent data = higher confidence
  const mostRecent = new Date(Math.max(...expenses.map((e: any) => new Date(e.date).getTime())));
  const daysSinceRecent = Math.abs(new Date().getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24);
  const recencyFactor = Math.max(0, 0.3 * (1 - daysSinceRecent / 90)); // Reduce confidence for data older than 90 days
  
  // Consistent amounts = higher confidence
  const variance = calculateVariance(expenses.map(e => e.amount));
  const consistencyFactor = Math.max(0, 0.4 * (1 - variance));
  
  return Math.min(1, dataPointFactor + patternFactor + recencyFactor + consistencyFactor);
}

// For backward compatibility
export function calculateAverageAmount(items: any[]) {
  if (!items?.length) return 0;
  return items.reduce((sum, item) => sum + (item.amount || 0), 0) / items.length;
}
