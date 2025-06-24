
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { RealEgressMetrics, EgressAlert } from './monitoring/types';
import { PreciseEgressTracker } from './monitoring/EgressTracker';
import { installEgressInterceptor } from './monitoring/egressInterceptor';
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
      const todayBytes = tracker.getTodayBytes();
      const sourceBreakdown = tracker.getSourceBreakdown();
      const hourlyBreakdown = tracker.getHourlyBreakdown();
      const stats = tracker.getStats();
      
      // Intentar obtener datos reales de Supabase
      const supabaseData = await fetchSupabaseAnalytics();
      
      // Usar datos reales si están disponibles, sino usar tracking local
      const actualTodayBytes = supabaseData?.egress_bytes_today || todayBytes;
      
      // Calcular estimaciones basadas en datos locales
      const thisWeekBytes = actualTodayBytes * 7 * 0.8;
      const thisMonthBytes = actualTodayBytes * 30 * 0.7;
      
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
      
      const newAlerts = checkAndGenerateAlerts(newMetrics, stats);
      if (newAlerts.length > 0) {
        setAlerts(prev => [...prev, ...newAlerts]);
      }
      
    } catch (error) {
      console.error('Error calculating precise egress metrics:', error);
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
  };

  const getTopEndpoints = () => {
    return trackerRef.current.getTopEndpoints();
  };

  const getTrackerStats = () => {
    return trackerRef.current.getStats();
  };

  // Instalar interceptor y monitoreo automático
  useEffect(() => {
    installEgressInterceptor();
    calculatePreciseMetrics();
    
    // Actualizar métricas cada 30 segundos
    const interval = setInterval(calculatePreciseMetrics, 30 * 1000);
    
    return () => clearInterval(interval);
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
    getTrackerStats
  };
};
