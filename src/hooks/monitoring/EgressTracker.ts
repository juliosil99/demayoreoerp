
import type { RequestLog, EgressSource, TrackerStats } from './types';

export class PreciseEgressTracker {
  private static instance: PreciseEgressTracker;
  private requestsLog: RequestLog[] = [];
  private totalBytesTracked: number = 0;
  private startTime: Date = new Date();

  static getInstance(): PreciseEgressTracker {
    if (!PreciseEgressTracker.instance) {
      PreciseEgressTracker.instance = new PreciseEgressTracker();
    }
    return PreciseEgressTracker.instance;
  }

  trackRequest(endpoint: string, responseSize: number, method: string, responseTime: number) {
    const request: RequestLog = {
      endpoint,
      size: responseSize,
      timestamp: new Date(),
      method,
      responseTime,
      table: this.extractTableFromEndpoint(endpoint)
    };

    this.requestsLog.push(request);
    this.totalBytesTracked += responseSize;

    // Mantener solo las últimas 2000 requests para evitar memory leaks
    if (this.requestsLog.length > 2000) {
      const removed = this.requestsLog.splice(0, 500);
      removed.forEach(req => this.totalBytesTracked -= req.size);
    }

    // Log requests grandes inmediatamente
    if (responseSize > 500000) { // > 500KB
      console.warn(`🚨 Large response: ${method} ${endpoint} - ${(responseSize / 1024 / 1024).toFixed(2)}MB in ${responseTime.toFixed(0)}ms`);
    }

    // Log para debugging
    console.log(`📊 [Egress] ${method} ${request.table}: ${(responseSize / 1024).toFixed(1)}KB`);
  }

  private extractTableFromEndpoint(endpoint: string): string {
    try {
      const pathParts = endpoint.split('/');
      const restIndex = pathParts.findIndex(part => part === 'rest');
      if (restIndex !== -1 && pathParts[restIndex + 2]) {
        return pathParts[restIndex + 2].split('?')[0];
      }
      
      // Fallback para otros patterns
      const tableMatch = endpoint.match(/\/([a-zA-Z_]+)(\?|$)/);
      return tableMatch ? tableMatch[1] : 'unknown';
    } catch (error) {
      return 'unknown';
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
    
    const endpoints = new Map<string, { bytes: number; count: number; table: string }>();
    
    this.requestsLog
      .filter(req => req.timestamp >= today)
      .forEach(req => {
        const key = `${req.method} /${req.table}`;
        const current = endpoints.get(key) || { bytes: 0, count: 0, table: req.table };
        endpoints.set(key, {
          bytes: current.bytes + req.size,
          count: current.count + 1,
          table: req.table
        });
      });

    return Array.from(endpoints.entries())
      .map(([endpoint, data]) => ({ 
        endpoint, 
        bytes: data.bytes,
        count: data.count,
        avgSize: data.bytes / data.count,
        table: data.table
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, limit);
  }

  reset() {
    this.requestsLog = [];
    this.totalBytesTracked = 0;
    this.startTime = new Date();
    console.log('🔄 Egress tracker reset');
  }

  getStats(): TrackerStats {
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
