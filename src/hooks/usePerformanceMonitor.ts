
import { useAdvancedPerformanceMonitor } from './useAdvancedPerformanceMonitor';
import { logger } from '@/utils/logger';

// Mantener compatibilidad con el hook existente y expandir funcionalidad
export const usePerformanceMonitor = () => {
  const { measureQuery, logQuery, metrics, isEnabled, setIsEnabled } = useAdvancedPerformanceMonitor();

  // Método legacy para compatibilidad
  const logMetrics = (metricsData: {
    queryName: string;
    duration: number;
    recordCount?: number;
  }) => {
    logger.query(metricsData.queryName, metricsData.duration, metricsData.recordCount, 'legacy');
  };

  // Método mejorado que integra con el sistema avanzado
  const measureQueryWithLogging = async <T>(
    queryName: string,
    queryFn: () => Promise<T>,
    component?: string
  ): Promise<T> => {
    return measureQuery(queryName, queryFn, 'general', undefined);
  };

  return { 
    measureQuery: measureQueryWithLogging,
    logMetrics,
    logQuery,
    metrics,
    isEnabled,
    setIsEnabled
  };
};
