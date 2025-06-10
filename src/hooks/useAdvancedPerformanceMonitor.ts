
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface QueryMetrics {
  queryName: string;
  duration: number;
  recordCount?: number;
  timestamp: Date;
  userId?: string;
  category: 'dashboard' | 'banking' | 'sales' | 'expenses' | 'general';
  status: 'success' | 'error';
  errorMessage?: string;
}

interface PerformanceMetrics {
  totalQueries: number;
  averageResponseTime: number;
  slowQueries: QueryMetrics[];
  errorRate: number;
  queriesByCategory: Record<string, number>;
  topSlowQueries: QueryMetrics[];
}

interface AlertThresholds {
  slowQueryThreshold: number; // ms
  errorRateThreshold: number; // percentage
  maxSlowQueries: number;
}

export const useAdvancedPerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalQueries: 0,
    averageResponseTime: 0,
    slowQueries: [],
    errorRate: 0,
    queriesByCategory: {},
    topSlowQueries: []
  });

  const [isEnabled, setIsEnabled] = useState(true);
  const queryHistory = useRef<QueryMetrics[]>([]);
  
  const thresholds: AlertThresholds = {
    slowQueryThreshold: 2000, // 2 seconds
    errorRateThreshold: 5, // 5%
    maxSlowQueries: 10
  };

  // Función para loggear queries automáticamente
  const logQuery = async (queryMetrics: Omit<QueryMetrics, 'timestamp'>) => {
    if (!isEnabled) return;

    const fullMetrics: QueryMetrics = {
      ...queryMetrics,
      timestamp: new Date()
    };

    // Agregar al historial local
    queryHistory.current.push(fullMetrics);
    
    // Mantener solo las últimas 100 queries en memoria
    if (queryHistory.current.length > 100) {
      queryHistory.current = queryHistory.current.slice(-100);
    }

    // Si es una query lenta, alertar inmediatamente
    if (fullMetrics.duration > thresholds.slowQueryThreshold) {
      console.warn(`🐌 Slow Query Detected: ${fullMetrics.queryName} took ${fullMetrics.duration}ms`);
      
      // Persistir query lenta en Supabase para análisis
      try {
        await persistSlowQuery(fullMetrics);
      } catch (error) {
        console.error('Error persisting slow query:', error);
      }
    }

    // Si hay error, loggear para análisis
    if (fullMetrics.status === 'error') {
      console.error(`❌ Query Error: ${fullMetrics.queryName} - ${fullMetrics.errorMessage}`);
      
      try {
        await persistQueryError(fullMetrics);
      } catch (error) {
        console.error('Error persisting query error:', error);
      }
    }

    // Actualizar métricas locales
    updateLocalMetrics();
  };

  const persistSlowQuery = async (queryMetrics: QueryMetrics) => {
    // Solo persistir en desarrollo o si es crítico
    if (process.env.NODE_ENV === 'development' || queryMetrics.duration > 5000) {
      const { error } = await supabase
        .from('performance_logs')
        .insert({
          query_name: queryMetrics.queryName,
          duration: queryMetrics.duration,
          record_count: queryMetrics.recordCount,
          category: queryMetrics.category,
          status: queryMetrics.status,
          error_message: queryMetrics.errorMessage,
          user_id: queryMetrics.userId,
          created_at: queryMetrics.timestamp.toISOString()
        });

      if (error && error.code !== '42P01') { // Ignorar si la tabla no existe
        console.error('Error saving slow query:', error);
      }
    }
  };

  const persistQueryError = async (queryMetrics: QueryMetrics) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .insert({
          query_name: queryMetrics.queryName,
          duration: queryMetrics.duration,
          category: queryMetrics.category,
          error_message: queryMetrics.errorMessage,
          user_id: queryMetrics.userId,
          created_at: queryMetrics.timestamp.toISOString()
        });

      if (error && error.code !== '42P01') { // Ignorar si la tabla no existe
        console.error('Error saving query error:', error);
      }
    } catch (err) {
      // Silencio errores de logging para no interferir con el flujo principal
    }
  };

  const updateLocalMetrics = () => {
    const recentQueries = queryHistory.current.slice(-50); // Últimas 50 queries
    
    if (recentQueries.length === 0) return;

    const totalQueries = recentQueries.length;
    const averageResponseTime = recentQueries.reduce((sum, q) => sum + q.duration, 0) / totalQueries;
    const slowQueries = recentQueries.filter(q => q.duration > thresholds.slowQueryThreshold);
    const errorQueries = recentQueries.filter(q => q.status === 'error');
    const errorRate = (errorQueries.length / totalQueries) * 100;

    const queriesByCategory = recentQueries.reduce((acc, query) => {
      acc[query.category] = (acc[query.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSlowQueries = [...slowQueries]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    setMetrics({
      totalQueries,
      averageResponseTime,
      slowQueries,
      errorRate,
      queriesByCategory,
      topSlowQueries
    });

    // Alertas automáticas
    if (errorRate > thresholds.errorRateThreshold) {
      toast.error(`Alto ratio de errores: ${errorRate.toFixed(1)}%`, {
        duration: 5000
      });
    }

    if (slowQueries.length > thresholds.maxSlowQueries) {
      toast.warning(`Demasiadas queries lentas: ${slowQueries.length} queries > ${thresholds.slowQueryThreshold}ms`, {
        duration: 5000
      });
    }
  };

  // Hook para medir performance de queries automáticamente
  const measureQuery = async <T>(
    queryName: string,
    queryFn: () => Promise<T>,
    category: QueryMetrics['category'] = 'general',
    userId?: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      await logQuery({
        queryName,
        duration,
        recordCount: Array.isArray(result) ? result.length : undefined,
        category,
        status: 'success',
        userId
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      await logQuery({
        queryName,
        duration,
        category,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      
      throw error;
    }
  };

  // Limpiar métricas antiguas cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - (30 * 60 * 1000); // 30 minutos
      queryHistory.current = queryHistory.current.filter(
        q => q.timestamp.getTime() > cutoff
      );
      updateLocalMetrics();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    isEnabled,
    setIsEnabled,
    measureQuery,
    logQuery,
    queryHistory: queryHistory.current.slice(-20) // Últimas 20 para visualización
  };
};
