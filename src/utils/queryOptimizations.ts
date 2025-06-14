
// Utility functions for query optimizations to reduce Egress

interface CacheConfig {
  staleTime: number;
  gcTime: number;
}

// Standard cache configurations for different data types
export const CACHE_CONFIGS = {
  // Static data that rarely changes
  STATIC: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 1 hour
  },
  
  // Dynamic data that changes frequently
  DYNAMIC: {
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 15 * 60 * 1000,    // 15 minutes
  },
  
  // Real-time data
  REALTIME: {
    staleTime: 30 * 1000,      // 30 seconds
    gcTime: 2 * 60 * 1000,     // 2 minutes
  }
} as const;

// Optimize select queries by limiting columns
export const OPTIMIZED_SELECTS = {
  SALES_MINIMAL: `
    id,
    date,
    price,
    Profit,
    orderNumber,
    Channel,
    productName,
    Quantity
  `,
  
  EXPENSES_MINIMAL: `
    id,
    date,
    description,
    amount,
    currency,
    account_id,
    chart_account_id,
    reference_number
  `,
  
  BANK_ACCOUNTS_MINIMAL: `
    id,
    name,
    type,
    balance,
    currency,
    company_id
  `,
  
  CONTACTS_MINIMAL: `
    id,
    name,
    type,
    rfc
  `
} as const;

// Data limits for different contexts
export const DATA_LIMITS = {
  DASHBOARD_CHART_POINTS: 100,
  TRANSACTION_HISTORY: 100,
  RECENT_EXPENSES: 50,
  RECENT_SALES: 1000,
  TOP_CHANNELS: 10,
  TOP_SKUS: 20
} as const;

// Helper function to calculate date ranges efficiently
export function getOptimizedDateRange(dateRange?: { from?: Date; to?: Date }) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    startDate: dateRange?.from || thirtyDaysAgo,
    endDate: dateRange?.to || now
  };
}

// Helper to format dates for SQL queries
export function formatDateForSQL(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper to create optimized query keys
export function createOptimizedQueryKey(
  baseKey: string, 
  params: Record<string, any>
): string[] {
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  
  return [baseKey, JSON.stringify(filteredParams)];
}
