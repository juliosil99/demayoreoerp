import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { RealEgressMetrics, EgressAlert } from './monitoring/types';
import { PersistentEgressTracker } from './monitoring/PersistentEgressTracker';
import { robustEgressInterceptor } from './monitoring/robustEgressInterceptor';
import { fetchRealSupabaseAnalytics, getLocalTrackerData, combineAnalyticsData } from './monitoring/realAnalyticsService';
import { checkAndGenerateAlerts } from './monitoring/alertUtils';

export const useRealEgressMonitor = () => {
  const [metrics, setMetrics] = useState<RealEgressMetrics>({
    totalBytesToday: 0,
    totalBytesThisWeek: 0,
    totalBytesThisMonth: 0,
    sourceBreakdown: [],
    hourlyBreakdown: [],
    alertLevel: 'normal',
    lastUpdated: new Date(),
    estimatedDailyCost: 0,
    dailyLimit: 50000000, // 50MB conservative limit
    usagePercentage: 0
  });
  
  const [alerts, setAlerts] = useState<EgressAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const trackerRef = useRef(PersistentEgressTracker.getInstance());

  const calculateRealMetrics = async () => {
    try {
      setIsLoading(true);
      
      const tracker = trackerRef.current;
      
      // Force refresh tracker data from storage to get latest state
      tracker.forceRefresh();
      
      // Get real data from local tracker
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
      
      console.log('🔍 Monitor diagnostics:', {
        interceptorActive: robustEgressInterceptor.isActive(),
        trackerActive: diagnostics.isActive,
        todayRequests: diagnostics.todayRequests,
        todayBytes: combinedData.egress_bytes_today,
        lastRequest: diagnostics.lastRequest,
        dataSource: combinedData.source,
        trackerVersion: diagnostics.version,
        sourceBreakdownCount: sourceBreakdown.length
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
      
      const newMetrics: RealEgressMetrics = {
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

      setMetrics(newMetrics);
      
      // Generate alerts only if we have real data
      if (combinedData.egress_bytes_today > 0) {
        const newAlerts = checkAndGenerateAlerts(newMetrics, stats);
        if (newAlerts.length > 0) {
          setAlerts(prev => [...prev, ...newAlerts]);
        }
      }
      
    } catch (error) {
      console.error('❌ Error calculating real egress metrics:', error);
      toast.error('Error al calcular métricas de Egress reales');
    } finally {
      setIsLoading(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const clearAcknowledgedAlerts = () => {
    setAlerts(prev => prev.filter(alert => !alert.acknowledged));
  };

  const resetTracker = () => {
    trackerRef.current.reset();
    toast.success('Tracker de Egress reiniciado');
    // Wait a moment for reset to complete, then recalculate
    setTimeout(() => {
      calculateRealMetrics();
    }, 500);
  };

  const getTopEndpoints = () => {
    const tracker = trackerRef.current;
    tracker.forceRefresh(); // Ensure we have latest data
    return tracker.getTopEndpoints();
  };

  const getTrackerStats = () => {
    const tracker = trackerRef.current;
    tracker.forceRefresh(); // Ensure we have latest data
    return tracker.getStats();
  };

  const getDiagnostics = () => {
    const tracker = trackerRef.current;
    tracker.forceRefresh(); // Ensure we have latest data
    const interceptorState = robustEgressInterceptor.getState();
    
    return {
      interceptorActive: robustEgressInterceptor.isActive(),
      interceptorRequestCount: interceptorState.requestCount,
      lastInterceptorRequest: interceptorState.lastRequestTime,
      ...tracker.getDiagnostics()
    };
  };

  const runDiagnosticTest = async () => {
    console.log('🔧 Running comprehensive diagnostic test...');
    
    const success = await robustEgressInterceptor.testInterceptor();
    
    if (success) {
      toast.success('Test del interceptor exitoso - datos deberían aparecer pronto');
      // Wait a moment for the request to be processed, then update metrics
      setTimeout(() => {
        calculateRealMetrics();
      }, 2000); // Increased wait time
    } else {
      toast.error('Test del interceptor falló - revisar consola para detalles');
    }
    
    return success;
  };

  const forceRefresh = () => {
    console.log('🔄 Forcing complete refresh...');
    // Force refresh tracker first
    trackerRef.current.forceRefresh();
    calculateRealMetrics();
  };

  // Initialize interceptor and monitoring
  useEffect(() => {
    console.log('🚀 Initializing real egress monitor with robust interceptor...');
    
    // Install robust interceptor
    robustEgressInterceptor.install();
    
    // Calculate initial metrics
    calculateRealMetrics();
    
    // Update metrics every 10 seconds (more responsive)
    const interval = setInterval(() => {
      console.log('⏰ Auto-updating metrics...');
      calculateRealMetrics();
    }, 10 * 1000);
    
    return () => {
      clearInterval(interval);
      // Cleanup tracker
      trackerRef.current.cleanup();
      console.log('🛑 Egress monitor cleanup completed');
    };
  }, []);

  return {
    metrics,
    alerts,
    isLoading,
    acknowledgeAlert,
    clearAcknowledgedAlerts,
    refreshMetrics: calculateRealMetrics,
    forceRefresh,
    resetTracker,
    getTopEndpoints,
    getTrackerStats,
    getDiagnostics,
    runDiagnosticTest
  };
};
