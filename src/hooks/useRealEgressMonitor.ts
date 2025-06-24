
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { RealEgressMetrics, EgressAlert } from './monitoring/types';
import { PreciseEgressTracker } from './monitoring/EgressTracker';
import { installEgressInterceptor, isInterceptorActive, testInterceptor } from './monitoring/egressInterceptor';
import { fetchSupabaseAnalytics } from './monitoring/analyticsService';
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
    dailyLimit: 50000000, // 50MB límite conservador
    usagePercentage: 0
  });
  
  const [alerts, setAlerts] = useState<EgressAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const trackerRef = useRef(PreciseEgressTracker.getInstance());

  const calculatePreciseMetrics = async () => {
    try {
      setIsLoading(true);
      
      const tracker = trackerRef.current;
      
      // Obtener datos reales del tracker (sin hardcoding)
      const todayBytes = tracker.getTodayBytes();
      const sourceBreakdown = tracker.getSourceBreakdown();
      const hourlyBreakdown = tracker.getHourlyBreakdown();
      const stats = tracker.getStats();
      const diagnostics = tracker.getDiagnostics();
      
      console.log('🔍 Monitor diagnostics:', {
        interceptorActive: isInterceptorActive(),
        trackerActive: diagnostics.isActive,
        todayRequests: diagnostics.todayRequests,
        todayBytes: todayBytes,
        lastRequest: diagnostics.lastRequest
      });
      
      // Intentar obtener datos reales de Supabase (sin usar como fallback hardcodeado)
      const supabaseData = await fetchSupabaseAnalytics();
      
      // Usar SOLO datos reales - no estimates artificiales
      let actualTodayBytes = todayBytes;
      let thisWeekBytes = 0;
      let thisMonthBytes = 0;
      
      // Si tenemos datos de Supabase Analytics, usarlos
      if (supabaseData?.egress_bytes_today) {
        actualTodayBytes = Math.max(todayBytes, supabaseData.egress_bytes_today);
        console.log('📊 Using Supabase Analytics data as primary source');
      } else if (todayBytes > 0) {
        console.log('📊 Using local tracker data as primary source');
      } else {
        console.log('⚠️ No data available - neither tracker nor analytics');
      }
      
      // Solo calcular proyecciones si tenemos datos reales
      if (actualTodayBytes > 0) {
        const currentHour = new Date().getHours();
        const hoursInDay = 24;
        const projectedDailyBytes = currentHour > 0 ? (actualTodayBytes / currentHour) * hoursInDay : actualTodayBytes;
        
        thisWeekBytes = projectedDailyBytes * 7;
        thisMonthBytes = projectedDailyBytes * 30;
      }
      
      const dailyLimit = 50000000; // 50MB límite conservador
      const usagePercentage = (actualTodayBytes / dailyLimit) * 100;
      
      let alertLevel: 'normal' | 'warning' | 'critical' = 'normal';
      if (usagePercentage > 150) alertLevel = 'critical';
      else if (usagePercentage > 80) alertLevel = 'warning';
      
      const newMetrics: RealEgressMetrics = {
        totalBytesToday: actualTodayBytes,
        totalBytesThisWeek: thisWeekBytes,
        totalBytesThisMonth: thisMonthBytes,
        sourceBreakdown,
        hourlyBreakdown,
        alertLevel,
        lastUpdated: new Date(),
        estimatedDailyCost: (actualTodayBytes / 1000000000) * 0.09, // $0.09 per GB
        dailyLimit,
        usagePercentage,
        realSupabaseData: supabaseData ? {
          totalEgress: supabaseData.total_egress || 0,
          timestamp: new Date()
        } : undefined
      };

      setMetrics(newMetrics);
      
      // Solo generar alertas si tenemos datos reales
      if (actualTodayBytes > 0) {
        const newAlerts = checkAndGenerateAlerts(newMetrics, stats);
        if (newAlerts.length > 0) {
          setAlerts(prev => [...prev, ...newAlerts]);
        }
      }
      
    } catch (error) {
      console.error('❌ Error calculating precise egress metrics:', error);
      toast.error('Error al calcular métricas de Egress precisas');
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
    calculatePreciseMetrics(); // Recalcular inmediatamente
  };

  const getTopEndpoints = () => {
    return trackerRef.current.getTopEndpoints();
  };

  const getTrackerStats = () => {
    return trackerRef.current.getStats();
  };

  const getDiagnostics = () => {
    const tracker = trackerRef.current;
    return {
      interceptorActive: isInterceptorActive(),
      ...tracker.getDiagnostics()
    };
  };

  const runDiagnosticTest = async () => {
    console.log('🔧 Running full diagnostic test...');
    
    const success = await testInterceptor();
    
    if (success) {
      toast.success('Test del interceptor exitoso');
      calculatePreciseMetrics();
    } else {
      toast.error('Test del interceptor falló');
    }
    
    return success;
  };

  // Instalar interceptor y monitoreo automático
  useEffect(() => {
    console.log('🚀 Initializing real egress monitor...');
    
    installEgressInterceptor();
    calculatePreciseMetrics();
    
    // Actualizar métricas cada 30 segundos
    const interval = setInterval(() => {
      console.log('⏰ Updating metrics automatically...');
      calculatePreciseMetrics();
    }, 30 * 1000);
    
    return () => {
      clearInterval(interval);
      console.log('🛑 Egress monitor cleanup completed');
    };
  }, []);

  return {
    metrics,
    alerts,
    isLoading,
    acknowledgeAlert,
    clearAcknowledgedAlerts,
    refreshMetrics: calculatePreciseMetrics,
    resetTracker,
    getTopEndpoints,
    getTrackerStats,
    getDiagnostics,
    runDiagnosticTest
  };
};
