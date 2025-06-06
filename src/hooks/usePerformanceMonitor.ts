
import { useEffect } from 'react';

interface PerformanceMetrics {
  queryName: string;
  duration: number;
  recordCount?: number;
}

export const usePerformanceMonitor = () => {
  const logMetrics = (metrics: PerformanceMetrics) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Query Performance: ${metrics.queryName}`, {
        duration: `${metrics.duration}ms`,
        records: metrics.recordCount || 'N/A',
        efficiency: metrics.recordCount 
          ? `${(metrics.recordCount / metrics.duration * 1000).toFixed(2)} records/sec`
          : 'N/A'
      });
    }
  };

  const measureQuery = async <T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await queryFn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      logMetrics({
        queryName,
        duration,
        recordCount: Array.isArray(result) ? result.length : undefined
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`❌ Query Failed: ${queryName}`, {
        duration: `${duration}ms`,
        error
      });
      
      throw error;
    }
  };

  return { measureQuery, logMetrics };
};
