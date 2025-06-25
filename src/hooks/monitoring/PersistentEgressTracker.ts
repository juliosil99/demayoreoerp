import type { RequestLog, EgressSource, TrackerStats } from './types';

interface PersistedData {
  requests: RequestLog[];
  totalBytes: number;
  startTime: string;
  lastSaved: string;
}

export class PersistentEgressTracker {
  private static instance: PersistentEgressTracker;
  private requestsLog: RequestLog[] = [];
  private totalBytesTracked: number = 0;
  private startTime: Date = new Date();
  private storageKey = 'egress-tracker-data';
  private saveInterval: NodeJS.Timeout | null = null;

  static getInstance(): PersistentEgressTracker {
    if (!PersistentEgressTracker.instance) {
      PersistentEgressTracker.instance = new PersistentEgressTracker();
      PersistentEgressTracker.instance.loadFromStorage();
      PersistentEgressTracker.instance.startAutoSave();
    }
    return PersistentEgressTracker.instance;
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const data: PersistedData = JSON.parse(saved);
        this.requestsLog = data.requests.map(req => ({
          ...req,
          timestamp: new Date(req.timestamp)
        }));
        this.totalBytesTracked = data.totalBytes;
        this.startTime = new Date(data.startTime);
        
        console.log('📂 Loaded egress data from storage:', {
          requests: this.requestsLog.length,
          totalBytes: this.totalBytesTracked,
          startTime: this.startTime
        });
      }
    } catch (error) {
      console.warn('⚠️ Could not load egress data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const data: PersistedData = {
        requests: this.requestsLog,
        totalBytes: this.totalBytesTracked,
        startTime: this.startTime.toISOString(),
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('⚠️ Could not save egress data to storage:', error);
    }
  }

  private startAutoSave() {
    // Save every 10 seconds
    this.saveInterval = setInterval(() => {
      this.saveToStorage();
    }, 10000);
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

    // Keep only last 5000 requests to prevent memory issues
    if (this.requestsLog.length > 5000) {
      const removed = this.requestsLog.splice(0, 1000);
      removed.forEach(req => this.totalBytesTracked -= req.size);
      console.log('🧹 Cleaned old requests from tracker');
    }

    // Save immediately for large requests
    if (responseSize > 1000000) { // > 1MB
      this.saveToStorage();
      console.warn(`🚨 Large response: ${method} ${endpoint} - ${(responseSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  private extractTableFromEndpoint(endpoint: string): string {
    try {
      // For REST endpoints: /rest/v1/table_name
      if (endpoint.includes('/rest/v1/')) {
        const match = endpoint.match(/\/rest\/v1\/([^?&/]+)/);
        if (match) return match[1];
      }
      
      // For edge functions: /functions/v1/function_name
      if (endpoint.includes('/functions/v1/')) {
        const match = endpoint.match(/\/functions\/v1\/([^?&/]+)/);
        if (match) return `function:${match[1]}`;
      }
      
      // For auth endpoints
      if (endpoint.includes('/auth/v1/')) {
        return 'auth';
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
        const key = `${req.method} ${req.endpoint}`;
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
    localStorage.removeItem(this.storageKey);
    console.log('🔄 Persistent egress tracker reset completely');
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
      memoryUsage: this.requestsLog.length * 200,
      isPersistent: true
    };
  }

  cleanup() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    this.saveToStorage(); // Final save
  }
}
