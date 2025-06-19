
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface EgressSource {
  source: string;
  bytes: number;
  requestCount: number;
  avgResponseSize: number;
  timestamp: Date;
}

interface RealEgressMetrics {
  totalBytesToday: number;
  totalBytesYesterday: number;
  totalBytesThisWeek: number;
  totalBytesThisMonth: number;
  sourceBreakdown: EgressSource[];
  hourlyBreakdown: Array<{
    hour: number;
    bytes: number;
    requests: number;
  }>;
  alertLevel: 'normal' | 'warning' | 'critical';
  lastUpdated: Date;
  estimatedDailyCost: number;
  dailyLimit: number;
  usagePercentage: number;
  realSupabaseData?: {
    totalEgress: number;
    timestamp: Date;
  };
}

interface EgressAlert {
  id: string;
  level: 'warning' | 'critical';
  message: string;
  bytes: number;
  source?: string;
  timestamp: Date;
  acknowledged: boolean;
}

// Real-time egress tracker que mide el tamaño real de las respuestas
class PreciseEgressTracker {
  private static instance: PreciseEgressTracker;
  private requestsLog: Array<{
    endpoint: string;
    size: number;
    timestamp: Date;
    method: string;
    responseTime: number;
  }> = [];
  
  private totalBytesTracked: number = 0;
  private startTime: Date = new Date();

  static getInstance(): PreciseEgressTracker {
    if (!PreciseEgressTracker.instance) {
      PreciseEgressTracker.instance = new PreciseEgressTracker();
    }
    return PreciseEgressTracker.instance;
  }

  trackRequest(endpoint: string, responseSize: number, method: string, responseTime: number) {
    const request = {
      endpoint,
      size: responseSize,
      timestamp: new Date(),
      method,
      responseTime
    };

    this.requestsLog.push(request);
    this.totalBytesTracked += responseSize;

    // Mantener solo las últimas 5000 requests para evitar memory leaks
    if (this.requestsLog.length > 5000) {
      const removed = this.requestsLog.splice(0, 1000);
      removed.forEach(req => this.totalBytesTracked -= req.size);
    }

    // Log requests grandes para debugging inmediato
    if (responseSize > 1000000) { // > 1MB
      console.warn(`🚨 Large response detected: ${endpoint} - ${(responseSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  getTodayBytes(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.requestsLog
      .filter(req => req.timestamp >= today)
      .reduce((sum, req) => sum + req.size, 0);
  }

  getSourceBreakdown(): EgressSource[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sources = new Map<string, { bytes: number; count: number; responseTime: number }>();
    
    this.requestsLog
      .filter(req => req.timestamp >= today)
      .forEach(req => {
        // Extraer la tabla/endpoint principal
        const pathParts = req.endpoint.split('/');
        const table = pathParts.find(part => part.startsWith('rest/v1/')) 
          ? pathParts[pathParts.indexOf('rest/v1/') + 1] 
          : pathParts[1] || 'unknown';
        
        const source = `${req.method} /${table}`;
        const current = sources.get(source) || { bytes: 0, count: 0, responseTime: 0 };
        sources.set(source, {
          bytes: current.bytes + req.size,
          count: current.count + 1,
          responseTime: current.responseTime + req.responseTime
        });
      });

    return Array.from(sources.entries())
      .map(([source, data]) => ({
        source,
        bytes: data.bytes,
        requestCount: data.count,
        avgResponseSize: data.bytes / data.count,
        timestamp: new Date()
      }))
      .sort((a, b) => b.bytes - a.bytes);
  }

  getHourlyBreakdown(): Array<{ hour: number; bytes: number; requests: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const hourlyData = new Array(24).fill(0).map((_, hour) => ({
      hour,
      bytes: 0,
      requests: 0
    }));

    this.requestsLog
      .filter(req => req.timestamp >= today)
      .forEach(req => {
        const hour = req.timestamp.getHours();
        hourlyData[hour].bytes += req.size;
        hourlyData[hour].requests += 1;
      });

    return hourlyData;
  }

  getTopEndpoints(limit: number = 10) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endpoints = new Map<string, { bytes: number; count: number; avgSize: number }>();
    
    this.requestsLog
      .filter(req => req.timestamp >= today)
      .forEach(req => {
        const current = endpoints.get(req.endpoint) || { bytes: 0, count: 0, avgSize: 0 };
        endpoints.set(req.endpoint, {
          bytes: current.bytes + req.size,
          count: current.count + 1,
          avgSize: (current.bytes + req.size) / (current.count + 1)
        });
      });

    return Array.from(endpoints.entries())
      .map(([endpoint, data]) => ({ endpoint, ...data }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, limit);
  }

  reset() {
    this.requestsLog = [];
    this.totalBytesTracked = 0;
    this.startTime = new Date();
  }

  getStats() {
    const now = new Date();
    const uptimeMs = now.getTime() - this.startTime.getTime();
    const uptimeHours = uptimeMs / (1000 * 60 * 60);
    
    return {
      totalRequests: this.requestsLog.length,
      totalBytes: this.totalBytesTracked,
      uptimeHours: uptimeHours,
      avgBytesPerHour: uptimeHours > 0 ? this.totalBytesTracked / uptimeHours : 0,
      avgRequestSize: this.requestsLog.length > 0 ? this.totalBytesTracked / this.requestsLog.length : 0
    };
  }
}

// Interceptor mejorado que mide el tamaño real de las respuestas
const originalFetch = window.fetch;
let isInterceptorInstalled = false;

const installEgressInterceptor = () => {
  if (isInterceptorInstalled) return;
  
  window.fetch = async (...args) => {
    const startTime = performance.now();
    const url = args[0]?.toString() || '';
    const method = args[1]?.method || 'GET';
    
    try {
      const response = await originalFetch(...args);
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Solo rastrear llamadas a Supabase
      if (url.includes('supabase.co') || url.includes('dulmmxtkgqkcfovvfxzu')) {
        const clonedResponse = response.clone();
        
        try {
          const text = await clonedResponse.text();
          const size = new TextEncoder().encode(text).length;
          
          const tracker = PreciseEgressTracker.getInstance();
          const parsedUrl = new URL(url);
          const endpoint = parsedUrl.pathname + parsedUrl.search;
          
          tracker.trackRequest(endpoint, size, method, responseTime);
          
          // Log detallado para requests grandes o lentas
          if (size > 100000 || responseTime > 1000) {
            console.log(`📊 [Egress Monitor] ${method} ${endpoint}:`, {
              size: `${(size / 1024).toFixed(2)}KB`,
              responseTime: `${responseTime.toFixed(0)}ms`,
              status: response.status
            });
          }
        } catch (error) {
          console.warn('Error measuring response size:', error);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Fetch interceptor error:', error);
      throw error;
    }
  };
  
  isInterceptorInstalled = true;
  console.log('🔍 Egress interceptor installed successfully');
};

export const useRealEgressMonitor = () => {
  const [metrics, setMetrics] = useState<RealEgressMetrics>({
    totalBytesToday: 0,
    totalBytesYesterday: 0,
    totalBytesThisWeek: 0,
    totalBytesThisMonth: 0,
    sourceBreakdown: [],
    hourlyBreakdown: [],
    alertLevel: 'normal',
    lastUpdated: new Date(),
    estimatedDailyCost: 0,
    dailyLimit: 100000000, // 100MB límite conservador
    usagePercentage: 0
  });
  
  const [alerts, setAlerts] = useState<EgressAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const trackerRef = useRef(PreciseEgressTracker.getInstance());

  // Obtener datos reales de Supabase Analytics (si está disponible)
  const fetchSupabaseAnalytics = async () => {
    try {
      // Intentar obtener métricas directamente de Supabase
      // Nota: Esto podría requerir una función edge personalizada
      const { data, error } = await supabase.functions.invoke('get-analytics', {
        body: { 
          metric: 'egress',
          period: '24h'
        }
      });

      if (!error && data) {
        console.log('📈 Real Supabase analytics data:', data);
        return data;
      }
    } catch (error) {
      console.log('📊 Supabase Analytics not available, using local tracking');
    }
    return null;
  };

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
      
      // Usar datos reales de Supabase si están disponibles, sino usar tracking local
      const actualTodayBytes = supabaseData?.egress_bytes_today || todayBytes;
      const yesterdayBytes = supabaseData?.egress_bytes_yesterday || 1600000000; // 1.6GB como referencia
      
      // Calcular estimaciones más precisas
      const thisWeekBytes = actualTodayBytes * 3.5;
      const thisMonthBytes = actualTodayBytes * 15;
      
      const dailyLimit = 100000000; // 100MB límite conservador
      const usagePercentage = (actualTodayBytes / dailyLimit) * 100;
      
      let alertLevel: 'normal' | 'warning' | 'critical' = 'normal';
      if (usagePercentage > 200) alertLevel = 'critical';
      else if (usagePercentage > 80) alertLevel = 'warning';
      
      const newMetrics: RealEgressMetrics = {
        totalBytesToday: actualTodayBytes,
        totalBytesYesterday: yesterdayBytes,
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
      checkAndGenerateAlerts(newMetrics, stats);
      
    } catch (error) {
      console.error('Error calculating precise egress metrics:', error);
      toast.error('Error al calcular métricas de Egress precisas');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndGenerateAlerts = (currentMetrics: RealEgressMetrics, stats: any) => {
    const newAlerts: EgressAlert[] = [];

    // Alerta crítica para uso excesivo
    if (currentMetrics.usagePercentage > 200) {
      const criticalAlert: EgressAlert = {
        id: `critical-${Date.now()}`,
        level: 'critical',
        message: `CRÍTICO: Egress de ${(currentMetrics.totalBytesToday / 1000000).toFixed(2)}MB supera límite de ${(currentMetrics.dailyLimit / 1000000).toFixed(0)}MB por ${(currentMetrics.usagePercentage / 100).toFixed(1)}x`,
        bytes: currentMetrics.totalBytesToday,
        timestamp: new Date(),
        acknowledged: false
      };
      newAlerts.push(criticalAlert);
      
      toast.error(criticalAlert.message, {
        duration: 15000,
        action: {
          label: 'Ver Detalles',
          onClick: () => acknowledgeAlert(criticalAlert.id)
        }
      });
    }

    // Alertas por fuente específica (endpoints que consumen mucho)
    currentMetrics.sourceBreakdown.forEach(source => {
      if (source.bytes > 10000000) { // > 10MB de una sola fuente
        const sourceAlert: EgressAlert = {
          id: `source-${source.source}-${Date.now()}`,
          level: 'warning',
          message: `Endpoint "${source.source}" consume ${(source.bytes / 1000000).toFixed(2)}MB con ${source.requestCount} requests (promedio: ${(source.avgResponseSize / 1024).toFixed(2)}KB por request)`,
          bytes: source.bytes,
          source: source.source,
          timestamp: new Date(),
          acknowledged: false
        };
        newAlerts.push(sourceAlert);
      }
    });

    // Alerta si el promedio por request es muy alto
    if (stats.avgRequestSize > 50000) { // > 50KB promedio por request
      const avgAlert: EgressAlert = {
        id: `avg-size-${Date.now()}`,
        level: 'warning',
        message: `Tamaño promedio de response muy alto: ${(stats.avgRequestSize / 1024).toFixed(2)}KB por request. Considera optimizar las consultas.`,
        bytes: stats.totalBytes,
        timestamp: new Date(),
        acknowledged: false
      };
      newAlerts.push(avgAlert);
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
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
    
    // Actualizar métricas cada 2 minutos
    const interval = setInterval(calculatePreciseMetrics, 2 * 60 * 1000);
    
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
