
import type { RequestLog, EgressSource, TrackerStats } from './types';

export class PreciseEgressTracker {
  private static instance: PreciseEgressTracker;
  private requestsLog: RequestLog[] = [];
  private totalBytesTracked: number = 0;
  private startTime: Date = new Date();

  static getInstance(): PreciseEgressTracker {
    if (!PreciseEgressTracker.instance) {
      PreciseEgressTracker.instance = new PreciseEgressTracker();
      console.log('🏗️ Egress tracker instance created');
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
      console.log('🧹 Cleaned old requests from tracker');
    }

    // Log requests grandes inmediatamente
    if (responseSize > 500000) { // > 500KB
      console.warn(`🚨 Large response detected: ${method} ${endpoint} - ${(responseSize / 1024 / 1024).toFixed(2)}MB in ${responseTime.toFixed(0)}ms`);
    }
  }

  private extractTableFromEndpoint(endpoint: string): string {
    try {
      // Para endpoints REST de Supabase: /rest/v1/table_name
      if (endpoint.includes('/rest/v1/')) {
        const match = endpoint.match(/\/rest\/v1\/([^?&/]+)/);
        if (match) return match[1];
      }
      
      // Para edge functions: /functions/v1/function_name
      if (endpoint.includes('/functions/v1/')) {
        const match = endpoint.match(/\/functions\/v1\/([^?&/]+)/);
        if (match) return `function:${match[1]}`;
      }
      
      // Fallback general
      const pathParts = endpoint.split('/').filter(part => part.length > 0);
      if (pathParts.length > 0) {
        return pathParts[pathParts.length - 1].split('?')[0];
      }
      
      return 'unknown';
    } catch (error) {
      console.warn('Error extracting table from endpoint:', endpoint, error);
      return 'unknown';
    }
  }

  getTodayBytes(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRequests = this.requestsLog.filter(req => req.timestamp >= today);
    const totalBytes = todayRequests.reduce((sum, req) => sum + req.size, 0);
    
    console.log(`📊 Today's bytes calculation:`, {
      totalRequests: todayRequests.length,
      totalBytes,
      formattedSize: `${(totalBytes / 1024).toFixed(2)}KB`
    });
    
    return totalBytes;
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

    const breakdown = Array.from(sources.entries())
      .map(([source, data]) => ({
        source,
        bytes: data.bytes,
        requestCount: data.count,
        avgResponseSize: data.bytes / data.count,
        timestamp: new Date()
      }))
      .sort((a, b) => b.bytes - a.bytes);
    
    console.log('📈 Source breakdown calculated:', breakdown.length, 'sources');
    
    return breakdown;
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
    
    console.log('🔝 Top endpoints calculated:', topEndpoints.length, 'endpoints');
    
    return topEndpoints;
  }

  reset() {
    this.requestsLog = [];
    this.totalBytesTracked = 0;
    this.startTime = new Date();
    console.log('🔄 Egress tracker reset completely');
  }

  getStats(): TrackerStats {
    const now = new Date();
    const uptimeMs = now.getTime() - this.startTime.getTime();
    const uptimeHours = uptimeMs / (1000 * 60 * 60);
    
    const stats = {
      totalRequests: this.requestsLog.length,
      totalBytes: this.totalBytesTracked,
      uptimeHours: uptimeHours,
      avgBytesPerHour: uptimeHours > 0 ? this.totalBytesTracked / uptimeHours : 0,
      avgRequestSize: this.requestsLog.length > 0 ? this.totalBytesTracked / this.requestsLog.length : 0
    };
    
    return stats;
  }

  // Nuevo método para diagnostics
  getDiagnostics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRequests = this.requestsLog.filter(req => req.timestamp >= today);
    const uniqueTables = new Set(this.requestsLog.map(req => req.table));
    const uniqueEndpoints = new Set(this.requestsLog.map(req => req.endpoint));
    
    return {
      isActive: this.requestsLog.length > 0,
      totalRequests: this.requestsLog.length,
      todayRequests: todayRequests.length,
      uniqueTables: uniqueTables.size,
      uniqueEndpoints: uniqueEndpoints.size,
      lastRequest: this.requestsLog[this.requestsLog.length - 1]?.timestamp,
      startTime: this.startTime,
      memoryUsage: this.requestsLog.length * 200 // estimación en bytes
    };
  }
}
