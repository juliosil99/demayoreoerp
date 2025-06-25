
import type { RealEgressMetrics } from '../types';
import { PersistentEgressTracker } from '../PersistentEgressTracker';
import { fetchRealSupabaseAnalytics, getLocalTrackerData, combineAnalyticsData } from '../realAnalyticsService';

export class MetricsCalculator {
  static async calculateRealMetrics(tracker: PersistentEgressTracker): Promise<RealEgressMetrics> {
    // Get real data from persistent tracker
    const localData = getLocalTrackerData(tracker);
    
    // Try to get Supabase analytics
    const supabaseData = await fetchRealSupabaseAnalytics();
    
    // Combine data sources intelligently
    const combinedData = combineAnalyticsData(supabaseData, localData);
    
    // Get detailed breakdowns from tracker
    const sourceBreakdown = tracker.getSourceBreakdown();
    const hourlyBreakdown = tracker.getHourlyBreakdown();
    const stats = tracker.getStats();
    const diagnostics = tracker.getDiagnostics();
    
    console.log('🔍 Enhanced monitor diagnostics:', {
      interceptorActive: true, // Will be set by caller
      trackerActive: diagnostics.isActive,
      todayRequests: diagnostics.todayRequests,
      todayBytes: combinedData.egress_bytes_today,
      avgBytesPerRequest: diagnostics.avgBytesPerRequest,
      lastRequest: diagnostics.lastRequest,
      dataSource: combinedData.source,
      trackerVersion: diagnostics.version,
      sourceBreakdownCount: sourceBreakdown.length,
      isInitialized: diagnostics.isInitialized,
      totalBytesTracked: diagnostics.totalBytesTracked
    });
    
    // Calculate projections ONLY if we have real data
    let thisWeekBytes = 0;
    let thisMonthBytes = 0;
    
    if (combinedData.egress_bytes_today > 0) {
      const currentHour = new Date().getHours();
      const hoursInDay = 24;
      const projectedDailyBytes = currentHour > 0 
        ? (combinedData.egress_bytes_today / currentHour) * hoursInDay 
        : combinedData.egress_bytes_today;
      
      thisWeekBytes = projectedDailyBytes * 7;
      thisMonthBytes = projectedDailyBytes * 30;
    }
    
    const dailyLimit = 50000000; // 50MB conservative limit
    const usagePercentage = (combinedData.egress_bytes_today / dailyLimit) * 100;
    
    let alertLevel: 'normal' | 'warning' | 'critical' = 'normal';
    if (usagePercentage > 150) alertLevel = 'critical';
    else if (usagePercentage > 80) alertLevel = 'warning';
    
    return {
      totalBytesToday: combinedData.egress_bytes_today,
      totalBytesThisWeek: thisWeekBytes,
      totalBytesThisMonth: thisMonthBytes,
      sourceBreakdown,
      hourlyBreakdown,
      alertLevel,
      lastUpdated: new Date(),
      estimatedDailyCost: (combinedData.egress_bytes_today / 1000000000) * 0.09, // $0.09 per GB
      dailyLimit,
      usagePercentage,
      realSupabaseData: supabaseData ? {
        totalEgress: supabaseData.total_egress || 0,
        timestamp: new Date()
      } : undefined,
      dataSource: combinedData.source,
      isEstimated: combinedData.isEstimate,
      sourceNote: combinedData.note
    };
  }
}
