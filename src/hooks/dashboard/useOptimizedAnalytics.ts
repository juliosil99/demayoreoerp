
import { DateRange } from "react-day-picker";
import { useMemo } from "react";

// Lightweight hook for Analytics - only provides basic contribution margin data
export function useOptimizedAnalytics(dateRange: DateRange | undefined) {
  // For now, we only provide basic data since the heavy components
  // (distribution charts, Top SKUs) have their own optimized hooks
  const analyticsData = useMemo(() => {
    return {
      contributionMargin: 0, // Will be calculated by individual components
      contributionMarginChange: 0
    };
  }, [dateRange]);

  return {
    analyticsData,
    isLoading: false,
    error: null
  };
}
