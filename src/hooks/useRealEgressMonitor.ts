import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { RealEgressMetrics, EgressAlert } from './monitoring/types';
import { PersistentEgressTracker } from './monitoring/PersistentEgressTracker';
import { deepNetworkInterceptor } from './monitoring/interceptor/DeepNetworkInterceptor';
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
  const isInitialized = useRef(false);

  const calculateRealMetrics = async () => {
    try {
      setIsLoading(true);
      
      const tracker = trackerRef.current;
      
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
        interceptorActive: deepNetworkInterceptor.isActive(),
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
      console.error('❌ Error calculating enhanced egress metrics:', error);
      toast.error('Error al calcular métricas de Egress mejoradas');
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
    toast.success('Enhanced Tracker de Egress reiniciado');
    setTimeout(() => {
      calculateRealMetrics();
    }, 500);
  };

  const getTopEndpoints = () => {
    const tracker = trackerRef.current;
    return tracker.getTopEndpoints();
  };

  const getTrackerStats = () => {
    const tracker = trackerRef.current;
    return tracker.getStats();
  };

  const getDiagnostics = () => {
    const tracker = trackerRef.current;
    const interceptorState = deepNetworkInterceptor.getState();
    
    return {
      interceptorActive: deepNetworkInterceptor.isActive(),
      interceptorRequestCount: interceptorState.requestCount,
      lastInterceptorRequest: interceptorState.lastRequestTime,
      ...tracker.getDiagnostics()
    };
  };

  const runDiagnosticTest = async () => {
    console.log('🔧 Running enhanced comprehensive diagnostic test...');
    
    const success = await deepNetworkInterceptor.testInterceptor();
    
    if (success) {
      toast.success('Test del interceptor mejorado exitoso - datos con bytes reales deberían aparecer pronto');
      setTimeout(() => {
        calculateRealMetrics();
      }, 2000);
    } else {
      toast.error('Test del interceptor mejorado falló - revisar consola para detalles');
    }
    
    return success;
  };

  const forceRefresh = () => {
    console.log('🔄 Forcing complete enhanced refresh...');
    calculateRealMetrics();
  };

  // Initialize enhanced deep interceptor and monitoring
  useEffect(() => {
    if (isInitialized.current) return;
    
    console.log('🚀 Initializing enhanced real egress monitor with deep interceptor...');
    
    // Install deep network interceptor with enhanced callback
    deepNetworkInterceptor.install((request) => {
      const tracker = trackerRef.current;
      const parsedUrl = new URL(request.url);
      const endpoint = parsedUrl.pathname + parsedUrl.search;
      
      // Pass enhanced metadata including calculation method and confidence
      tracker.trackRequest(
        endpoint, 
        request.size, 
        request.method, 
        request.responseTime,
        {
          sizeCalculationMethod: (request as any).sizeCalculationMethod,
          sizeConfidence: (request as any).sizeConfidence
        }
      );
    });
    
    // Calculate initial metrics
    calculateRealMetrics();
    
    // Update metrics every 15 seconds
    const interval = setInterval(() => {
      console.log('⏰ Auto-updating enhanced metrics...');
      calculateRealMetrics();
    }, 15 * 1000);
    
    isInitialized.current = true;
    
    return () => {
      clearInterval(interval);
      console.log('🔄 Enhanced monitor cleanup - tracker remains persistent');
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
