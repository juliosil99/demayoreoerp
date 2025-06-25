
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { RealEgressMetrics, EgressAlert } from './monitoring/types';
import { PersistentEgressTracker } from './monitoring/PersistentEgressTracker';
import { checkAndGenerateAlerts } from './monitoring/alertUtils';
import { MetricsCalculator } from './monitoring/real-egress/MetricsCalculator';
import { AlertsManager } from './monitoring/real-egress/AlertsManager';
import { DiagnosticsService } from './monitoring/real-egress/DiagnosticsService';
import { InitializationService } from './monitoring/real-egress/InitializationService';
import { deepNetworkInterceptor } from './monitoring/interceptor/DeepNetworkInterceptor';
import type { EgressMonitorHookReturn } from './monitoring/real-egress/types';

export const useRealEgressMonitor = (): EgressMonitorHookReturn => {
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
      const newMetrics = await MetricsCalculator.calculateRealMetrics(tracker);
      const stats = tracker.getStats();

      setMetrics(newMetrics);
      
      // Generate alerts only if we have real data
      if (newMetrics.totalBytesToday > 0) {
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
    setAlerts(prev => AlertsManager.acknowledgeAlert(prev, alertId));
  };

  const clearAcknowledgedAlerts = () => {
    setAlerts(prev => AlertsManager.clearAcknowledgedAlerts(prev));
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
    return DiagnosticsService.getDiagnostics(tracker);
  };

  const runDiagnosticTest = async () => {
    const success = await DiagnosticsService.runDiagnosticTest();
    
    if (success) {
      setTimeout(() => {
        calculateRealMetrics();
      }, 2000);
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
    
    const cleanup = InitializationService.initializeMonitoring(trackerRef, calculateRealMetrics);
    isInitialized.current = true;
    
    return cleanup;
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
