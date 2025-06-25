
import type { RequestLog, EgressSource } from '../types';

export class DataAnalyzer {
  static getTodayBytes(requests: RequestLog[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRequests = requests.filter(req => req.timestamp >= today);
    const totalBytes = todayRequests.reduce((sum, req) => sum + req.size, 0);
    
    console.log(`📊 Enhanced today's bytes calculation:`, {
      totalRequests: todayRequests.length,
      totalBytes,
      formattedSize: `${(totalBytes / 1024).toFixed(2)}KB`,
      allRequests: requests.length,
      avgRequestSize: todayRequests.length > 0 ? `${(totalBytes / todayRequests.length).toFixed(0)}B` : '0B'
    });
    
    return totalBytes;
  }

  static getSourceBreakdown(requests: RequestLog[]): EgressSource[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sources = new Map<string, { bytes: number; count: number; responseTime: number }>();
    
    requests
      .filter(req => req.timestamp >= today)
      .forEach(req => {
        const source = `${req.method} /${req.table}`;
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

  static getHourlyBreakdown(requests: RequestLog[]): Array<{ hour: number; bytes: number; requests: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const hourlyData = new Array(24).fill(0).map((_, hour) => ({
      hour,
      bytes: 0,
      requests: 0
    }));

    requests
      .filter(req => req.timestamp >= today)
      .forEach(req => {
        const hour = req.timestamp.getHours();
        hourlyData[hour].bytes += req.size;
        hourlyData[hour].requests += 1;
      });

    return hourlyData;
  }

  static getTopEndpoints(requests: RequestLog[], limit: number = 10) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endpoints = new Map<string, { bytes: number; count: number; table: string }>();
    
    requests
      .filter(req => req.timestamp >= today)
      .forEach(req => {
        const key = `${req.method} ${req.endpoint}`;
        const current = endpoints.get(key) || { bytes: 0, count: 0, table: req.table };
        endpoints.set(key, {
          bytes: current.bytes + req.size,
          count: current.count + 1,
          table: req.table
        });
      });

    const topEndpoints = Array.from(endpoints.entries())
      .map(([endpoint, data]) => ({ 
        endpoint, 
        bytes: data.bytes,
        count: data.count,
        avgSize: data.bytes / data.count,
        table: data.table
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, limit);
    
    console.log('🔝 Enhanced top endpoints calculated:', {
      totalEndpoints: endpoints.size,
      topEndpoints: topEndpoints.length,
      topEndpoint: topEndpoints[0]?.endpoint || 'none',
      topEndpointSize: topEndpoints[0] ? `${(topEndpoints[0].bytes / 1024).toFixed(2)}KB` : '0KB'
    });
    
    return topEndpoints;
  }
}
